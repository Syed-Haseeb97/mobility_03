import { haversineDistance, isValidCoordinate } from "../campus-zones";
import { geoCache } from "./geo-cache";

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
}

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
  attribution: string;
}

/**
 * Calculates road routing between pickup and drop-off coordinates.
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
          geometry: {
            type: "LineString",
            coordinates: [
              [origin.lng, origin.lat],
              [destination.lng, destination.lat],
            ],
          },
          isRecommended: true,
        },
      ],
      primaryGeometry: {
        type: "LineString",
        coordinates: [
          [origin.lng, origin.lat],
          [destination.lng, destination.lat],
        ],
      },
      source: "simulated_road_fallback",
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(orsUrl, {
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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const features = data.features;
        if (Array.isArray(features) && features.length > 0) {
          const routes: RouteOption[] = features.map((f: any, idx: number) => {
            const summary = f.properties?.summary || {};
            const distMeters = summary.distance || 0;
            const durSeconds = summary.duration || 0;
            const distKm = Math.round((distMeters / 1000) * 10) / 10;
            const durMins = Math.max(1, Math.round(durSeconds / 60));

            return {
              id: `ors-${idx + 1}`,
              name: idx === 0 ? "Fastest Campus Corridor" : `Alternative Route ${idx + 1}`,
              distanceKm: distKm,
              durationMins: durMins,
              summary: idx === 0 ? "Standard road connection via campus perimeter" : "Suburban detour route",
              geometry: f.geometry,
              isRecommended: idx === 0,
            };
          });

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
            attribution: "Directions data © OpenRouteService & OpenStreetMap contributors",
          };

          geoCache.set(cacheKey, result, 1800); // 30 mins
          return result;
        }
      }
    } catch (err) {
      console.warn("OpenRouteService routing failed, falling back to OSRM:", err);
    }
  }

  // 2. Try OSRM Public Routing Server (No key required, ODbL license)
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=true&steps=false`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(osrmUrl, {
      headers: {
        "User-Agent": "MOBILITY-Campus-Rental/1.0 (contact@mobility-campus.edu)",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.code === "Ok" && Array.isArray(data.routes) && data.routes.length > 0) {
        const routes: RouteOption[] = data.routes.map((r: any, idx: number) => {
          const distKm = Math.round((r.distance / 1000) * 10) / 10;
          // Apply speed adjustment for 2-wheelers inside campus if needed
          let durMins = Math.max(1, Math.round(r.duration / 60));
          if (vehicleWheels === "2-Wheeler" && durMins > 2) {
            durMins = Math.round(durMins * 0.9); // Two wheelers filter through campus gates slightly faster
          }

          return {
            id: `osrm-${idx + 1}`,
            name: idx === 0 ? "Fastest Road Corridor" : `Alternative Route ${idx + 1}`,
            distanceKm: distKm,
            durationMins: durMins,
            summary: idx === 0 ? "Main transit route along arterial roads" : "Alternate side-avenue route",
            geometry: r.geometry,
            isRecommended: idx === 0,
          };
        });

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
          attribution: "Routing data © OpenStreetMap contributors via OSRM",
        };

        geoCache.set(cacheKey, result, 1800);
        return result;
      }
    }
  } catch (err) {
    console.warn("OSRM routing request failed or timed out:", err);
  }

  // 3. Resilient Road Curvature Fallback
  // Real roads are rarely a straight line; apply a 1.28x road tortuosity factor for urban/campus transit
  const roadDistanceKm = Math.max(0.2, Math.round(directDistance * 1.28 * 10) / 10);
  const avgSpeedKmh = vehicleWheels === "2-Wheeler" ? 24 : 28; // km/h
  const durationMins = Math.max(2, Math.round((roadDistanceKm / avgSpeedKmh) * 60));

  // Generate realistic intermediate curve points for smooth map rendering
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
    formattedDistance: `${roadDistanceKm} km`,
    formattedDuration: `${durationMins} mins`,
    routes: [
      {
        id: "fallback-primary",
        name: "Estimated Campus Corridor",
        distanceKm: roadDistanceKm,
        durationMins,
        summary: "Calculated via campus road network model with 1.28× curvature factor",
        geometry: fallbackGeometry,
        isRecommended: true,
      },
    ],
    primaryGeometry: fallbackGeometry,
    source: "simulated_road_fallback",
    attribution: "MOBILITY Campus Road Model (Offline Fallback)",
  };

  geoCache.set(cacheKey, result, 600);
  return result;
}
