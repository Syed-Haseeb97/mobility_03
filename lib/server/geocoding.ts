import { CAMPUS_ZONES, findNearestCampusZone, isValidCoordinate } from "../campus-zones";
import { geoCache, rateLimitedNominatimFetch } from "./geo-cache";

export interface GeocodingResult {
  displayName: string;
  shortName: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  country?: string;
  campusZoneId?: string;
  isCampusZone?: boolean;
  attribution: string;
}

export interface ReverseGeocodingResult {
  displayName: string;
  shortName: string;
  lat: number;
  lng: number;
  nearestCampusZone?: {
    id: string;
    name: string;
    distanceKm: number;
  };
  attribution: string;
}

/**
 * Forward Geocoding: Converts an address or place query to geographical coordinates.
 */
export async function searchLocation(
  query: string,
  city?: string
): Promise<GeocodingResult[]> {
  const cleanQuery = (query || "").trim();
  if (!cleanQuery || cleanQuery.length < 2) return [];

  const cacheKey = `geocode:${cleanQuery.toLowerCase()}:${(city || "").toLowerCase()}`;
  const cached = geoCache.get<GeocodingResult[]>(cacheKey);
  if (cached) return cached;

  const results: GeocodingResult[] = [];

  // 1. Check local campus zones first for instant zero-latency match
  const lowerQuery = cleanQuery.toLowerCase();
  const campusMatches = CAMPUS_ZONES.filter((zone) => {
    const matchesCity = !city || city === "All locations" || zone.city.toLowerCase() === city.toLowerCase();
    const matchesText =
      zone.name.toLowerCase().includes(lowerQuery) ||
      zone.landmarks.some((lm) => lm.toLowerCase().includes(lowerQuery)) ||
      zone.code.toLowerCase().includes(lowerQuery);
    return matchesCity && matchesText;
  });

  for (const match of campusMatches) {
    results.push({
      displayName: `${match.name}, ${match.city}`,
      shortName: match.name,
      lat: match.coordinates.lat,
      lng: match.coordinates.lng,
      city: match.city,
      campusZoneId: match.id,
      isCampusZone: true,
      attribution: "MOBILITY Campus Zones Directory",
    });
  }

  // If we already have 3+ local campus matches, return early or continue
  if (results.length >= 4) {
    geoCache.set(cacheKey, results, 3600); // 1 hour
    return results;
  }

  // 2. OpenCage Geocoding if API key is provided
  const opencageKey = process.env.OPENCAGE_API_KEY;
  if (opencageKey) {
    try {
      const q = city && city !== "All locations" ? `${cleanQuery}, ${city}, India` : `${cleanQuery}, India`;
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(q)}&key=${opencageKey}&limit=5&no_annotations=1`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.results)) {
          for (const item of data.results) {
            const lat = item.geometry?.lat;
            const lng = item.geometry?.lng;
            if (isValidCoordinate(lat, lng)) {
              results.push({
                displayName: item.formatted || cleanQuery,
                shortName: item.components?.road || item.components?.neighbourhood || item.formatted?.split(",")[0] || cleanQuery,
                lat,
                lng,
                city: item.components?.city || item.components?.state_district,
                state: item.components?.state,
                country: item.components?.country,
                attribution: "Data © OpenCage / OpenStreetMap contributors",
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn("OpenCage geocoding query failed:", err);
    }
  } else {
    // 3. OpenStreetMap Nominatim with rate limiting and timeout
    try {
      const q = city && city !== "All locations" ? `${cleanQuery}, ${city}` : cleanQuery;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1&countrycodes=in`;
      const res = await rateLimitedNominatimFetch(url, {});

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          for (const item of data) {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);
            if (isValidCoordinate(lat, lng)) {
              results.push({
                displayName: item.display_name,
                shortName: item.name || item.display_name?.split(",")[0] || cleanQuery,
                lat,
                lng,
                city: item.address?.city || item.address?.town || item.address?.state_district,
                state: item.address?.state,
                country: item.address?.country,
                attribution: "Data © OpenStreetMap contributors, ODbL 1.0",
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn("Nominatim geocoding failed or timed out:", err);
    }
  }

  // Deduplicate results by coordinate proximity (< 100m)
  const uniqueResults: GeocodingResult[] = [];
  for (const r of results) {
    const isDuplicate = uniqueResults.some(
      (existing) => Math.abs(existing.lat - r.lat) < 0.001 && Math.abs(existing.lng - r.lng) < 0.001
    );
    if (!isDuplicate) {
      uniqueResults.push(r);
    }
  }

  geoCache.set(cacheKey, uniqueResults, 3600);
  return uniqueResults;
}

/**
 * Reverse Geocoding: Converts geographical coordinates to a human-readable location address.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodingResult> {
  if (!isValidCoordinate(lat, lng)) {
    throw new Error("Invalid latitude or longitude coordinates provided.");
  }

  const roundedLat = Math.round(lat * 10000) / 10000;
  const roundedLng = Math.round(lng * 10000) / 10000;
  const cacheKey = `reverse:${roundedLat}:${roundedLng}`;
  const cached = geoCache.get<ReverseGeocodingResult>(cacheKey);
  if (cached) return cached;

  // Check if near any predefined campus zone
  const nearest = findNearestCampusZone(lat, lng);
  const isDirectCampusHit = nearest && nearest.distanceKm <= 0.25; // within 250m

  let displayName = isDirectCampusHit ? `${nearest.zone.name}, ${nearest.zone.city}` : `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  let shortName = isDirectCampusHit ? nearest.zone.name : `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  let attribution = "MOBILITY Geocoding Engine";

  // Try OpenStreetMap Nominatim reverse
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await rateLimitedNominatimFetch(url, {});
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        if (isDirectCampusHit) {
          displayName = `${nearest.zone.name} (${data.display_name})`;
          shortName = nearest.zone.name;
        } else {
          displayName = data.display_name;
          shortName = data.name || data.address?.road || data.address?.suburb || displayName.split(",")[0];
        }
        attribution = "Data © OpenStreetMap contributors, ODbL 1.0";
      }
    }
  } catch (err) {
    console.warn("Reverse geocode request failed:", err);
  }

  const result: ReverseGeocodingResult = {
    displayName,
    shortName,
    lat,
    lng,
    nearestCampusZone: nearest
      ? {
          id: nearest.zone.id,
          name: nearest.zone.name,
          distanceKm: nearest.distanceKm,
        }
      : undefined,
    attribution,
  };

  geoCache.set(cacheKey, result, 7200); // 2 hours
  return result;
}
