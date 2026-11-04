import { haversineDistance, isValidCoordinate } from "../campus-zones";
import { geoCache } from "./geo-cache";
import { secureUpstreamFetch } from "./ssrf-guard";

export interface RouteGeometry {
  type: "LineString";
  coordinates: [number, number][]; // [longitude, latitude] pairs for GeoJSON
}

export interface RouteOption {
  id: string;
  name: string;
  distanceKm: number;
  durationMins: number;
  summary: string;
  geometry: RouteGeometry;
  isRecommended: boolean;
  isEstimated: boolean;
}

export type RouteType = "actual" | "estimated" | "unavailable";

export interface RouteCalculationResult {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  distanceKm: number;
  durationMins: number;
  formattedDistance: string;
  formattedDuration: string;
  routes: RouteOption[];
  primaryGeometry: RouteGeometry;
  source: "openrouteservice" | "osrm" | "simulated_road_fallback";
  routeType: RouteType;
  isEstimated: boolean;
  attribution: string;
}

/**
 * Validates that a route geometry contains valid numeric coordinates within GPS bounds.
 */
function isValidLineString(geometry: unknown): geometry is RouteGeometry {
  if (!geometry || typeof geometry !== "object") return false;
  const geom = geometry as RouteGeometry;
  if (geom.type !== "LineString" || !Array.isArray(geom.coordinates) || geom.coordinates.length < 2) {
    return false;
  }
  return geom.coordinates.every(
    (pt) =>
      Array.isArray(pt) &&
      pt.length >= 2 &&
      typeof pt[0] === "number" &&
      typeof pt[1] === "number" &&
      Number.isFinite(pt[0]) &&
      Number.isFinite(pt[1]) &&
      pt[0] >= -180 &&
      pt[0] <= 180 && // longitude
      pt[1] >= -90 &&
      pt[1] <= 90 // latitude
  );
}

/**
 * Calculates road routing between pickup and drop-off coordinates.
 *
 * Routing hierarchy:
 * 1. OpenRouteService (Primary, when OPENROUTESERVICE_API_KEY is configured) -> routeType: "actual"
 * 2. OSRM Demo Server (Secondary, configurable via ROUTING_FALLBACK_PROVIDER) -> routeType: "actual"
 * 3. Calibrated Campus Network Model (Local Fallback with 1.28x road curvature) -> routeType: "estimated"
 */
export async function calculateRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  vehicleWheels: "2-Wheeler" | "4-Wheeler" = "2-Wheeler"
): Promise<RouteCalculationResult> {
  if (!isValidCoordinate(origin.lat, origin.lng) || !isValidCoordinate(destination.lat, destination.lng)) {
    throw new Error("Invalid origin or destination coordinates.");
  }

  // If origin and destination are virtually identical (< 15 meters)
  const directDistance = haversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);
  if (directDistance < 0.015) {
    const samePointGeom: RouteGeometry = {
      type: "LineString",
      coordinates: [
        [origin.lng, origin.lat],
        [destination.lng, destination.lat],
      ],
    };
    return {
      origin,
      destination,
      distanceKm: 0.1,
      durationMins: 1,
      formattedDistance: "0.1 km (Same Zone)",
      formattedDuration: "1 min",
      routes: [
        {
          id: "r-same",
          name: "Direct Campus Bay Transit",
          distanceKm: 0.1,
          durationMins: 1,
          summary: "Intra-zone handover within same campus depot",
          geometry: samePointGeom,
          isRecommended: true,
          isEstimated: false,
        },
      ],
      primaryGeometry: samePointGeom,
      source: "simulated_road_fallback",
      routeType: "actual",
      isEstimated: false,
      attribution: "MOBILITY Campus Transit Estimator",
    };
  }

  const cacheKey = `route:${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}:${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}:${vehicleWheels}`;
  const cached = geoCache.get<RouteCalculationResult>(cacheKey);
  if (cached) return cached;

  // 1. Try OpenRouteService if API key is provided
  const orsApiKey = process.env.OPENROUTESERVICE_API_KEY;
  if (orsApiKey) {
    try {
      const orsProfile = vehicleWheels === "2-Wheeler" ? "cycling-regular" : "driving-car";
      const orsUrl = `https://api.openrouteservice.org/v2/directions/${orsProfile}/geojson`;

      const res = await secureUpstreamFetch(
        orsUrl,
        {
          method: "POST",
          headers: {
            Authorization: orsApiKey,
            "Content-Type": "application/json",
            Accept: "application/json, application/geo+json",
          },
          body: JSON.stringify({
            coordinates: [
              [origin.lng, origin.lat],
              [destination.lng, destination.lat],
            ],
            alternative_routes: { target_count: 2 },
            instructions: false,
          }),
        },
        6000
      );

      if (res.ok) {
        const data = await res.json();
        const features = data.features;
        if (Array.isArray(features) && features.length > 0) {
          const routes: RouteOption[] = [];
          for (let idx = 0; idx < features.length; idx++) {
            const f = features[idx];
            if (!isValidLineString(f.geometry)) continue;

            const summary = f.properties?.summary || {};
            const distMeters = Number(summary.distance) || 0;
            const durSeconds = Number(summary.duration) || 0;
            const distKm = Math.round((distMeters / 1000) * 10) / 10;
            const durMins = Math.max(1, Math.round(durSeconds / 60));

            routes.push({
              id: `ors-${idx + 1}`,
              name: idx === 0 ? "Fastest Campus Corridor" : `Alternative Route ${idx + 1}`,
              distanceKm: distKm,
              durationMins: durMins,
              summary: idx === 0 ? "Standard road connection via campus perimeter" : "Suburban detour route",
              geometry: f.geometry,
              isRecommended: idx === 0,
              isEstimated: false,
            });
          }

          if (routes.length > 0) {
            const primary = routes[0];
            const result: RouteCalculationResult = {
              origin,
              destination,
              distanceKm: primary.distanceKm,
              durationMins: primary.durationMins,
              formattedDistance: `${primary.distanceKm} km`,
              formattedDuration: `${primary.durationMins} mins`,
              routes,
              primaryGeometry: primary.geometry,
              source: "openrouteservice",
              routeType: "actual",
              isEstimated: false,
              attribution: "Directions data © OpenRouteService & OpenStreetMap contributors",
            };

            geoCache.set(cacheKey, result, 1800); // 30 mins
            return result;
          }
        }
      }
    } catch (err) {
      console.warn("OpenRouteService routing failed, falling back to secondary provider:", err);
    }
  }

  // 2. Try OSRM Public Routing Server (if enabled via ROUTING_FALLBACK_PROVIDER)
  const fallbackProvider = (process.env.ROUTING_FALLBACK_PROVIDER || "osrm").toLowerCase();
  if (fallbackProvider === "osrm") {
    try {
      const osrmBase = process.env.OSRM_ROUTING_URL || "https://router.project-osrm.org";
      const osrmUrl = `${osrmBase}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=true&steps=false`;

      const res = await secureUpstreamFetch(
        osrmUrl,
        {
          headers: {
            "User-Agent": "MOBILITY-Campus-Rental/1.0 (contact@mobility-campus.local)",
          },
        },
        5000
      );

      if (res.ok) {
        const data = await res.json();
        if (data.code === "Ok" && Array.isArray(data.routes) && data.routes.length > 0) {
          const routes: RouteOption[] = [];
          for (let idx = 0; idx < data.routes.length; idx++) {
            const r = data.routes[idx];
            if (!isValidLineString(r.geometry)) continue;

            const distKm = Math.round((Number(r.distance) / 1000) * 10) / 10;
            let durMins = Math.max(1, Math.round(Number(r.duration) / 60));
            if (vehicleWheels === "2-Wheeler" && durMins > 2) {
              durMins = Math.round(durMins * 0.9); // Two wheelers filter through campus gates slightly faster
            }

            routes.push({
              id: `osrm-${idx + 1}`,
              name: idx === 0 ? "Fastest Road Corridor" : `Alternative Route ${idx + 1}`,
              distanceKm: distKm,
              durationMins: durMins,
              summary: idx === 0 ? "Main transit route along arterial roads" : "Alternate side-avenue route",
              geometry: r.geometry,
              isRecommended: idx === 0,
              isEstimated: false,
            });
          }

          if (routes.length > 0) {
            const primary = routes[0];
            const result: RouteCalculationResult = {
              origin,
              destination,
              distanceKm: primary.distanceKm,
              durationMins: primary.durationMins,
              formattedDistance: `${primary.distanceKm} km`,
              formattedDuration: `${primary.durationMins} mins`,
              routes,
              primaryGeometry: primary.geometry,
              source: "osrm",
              routeType: "actual",
              isEstimated: false,
              attribution: "Routing data © OpenStreetMap contributors via OSRM",
            };

            geoCache.set(cacheKey, result, 1800);
            return result;
          }
        }
      }
    } catch (err) {
      console.warn("OSRM routing request failed or timed out:", err);
    }
  }

  // 3. Resilient Road Curvature Approximation (Offline Model)
  // Real roads are rarely straight lines; apply a calibrated 1.28x road tortuosity factor.
  // CRITICAL: Clearly mark this route as ESTIMATED so users are never misled.
  const roadDistanceKm = Math.max(0.2, Math.round(directDistance * 1.28 * 10) / 10);
  const avgSpeedKmh = vehicleWheels === "2-Wheeler" ? 24 : 28; // km/h
  const durationMins = Math.max(2, Math.round((roadDistanceKm / avgSpeedKmh) * 60));

  // Generate intermediate curve points for map rendering
  const midLat = (origin.lat + destination.lat) / 2;
  const midLng = (origin.lng + destination.lng) / 2;
  const offset = 0.0018; // gentle curve offset
  const intermediatePoint: [number, number] = [midLng + offset, midLat + offset];

  const fallbackGeometry: RouteGeometry = {
    type: "LineString",
    coordinates: [
      [origin.lng, origin.lat],
      intermediatePoint,
      [destination.lng, destination.lat],
    ],
  };

  const result: RouteCalculationResult = {
    origin,
    destination,
    distanceKm: roadDistanceKm,
    durationMins,
    formattedDistance: `~${roadDistanceKm} km (Estimated)`,
    formattedDuration: `~${durationMins} mins (Est.)`,
    routes: [
      {
        id: "fallback-primary",
        name: "Estimated Campus Corridor",
        distanceKm: roadDistanceKm,
        durationMins,
        summary: "Calculated via campus road network model with 1.28× curvature factor",
        geometry: fallbackGeometry,
        isRecommended: true,
        isEstimated: true,
      },
    ],
    primaryGeometry: fallbackGeometry,
    source: "simulated_road_fallback",
    routeType: "estimated",
    isEstimated: true,
    attribution: "MOBILITY Campus Road Model (Offline Estimate)",
  };

  geoCache.set(cacheKey, result, 600);
  return result;
}
