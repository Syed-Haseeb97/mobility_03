import test from "node:test";
import assert from "node:assert/strict";
import {
  isValidCoordinate,
  haversineDistance,
  CAMPUS_ZONES,
  getCampusZonesByCity,
  getCampusZoneById,
  findNearestCampusZone,
} from "../lib/campus-zones.ts";
import { calculateRoute } from "../lib/server/routing.ts";
import { searchLocation, reverseGeocode } from "../lib/server/geocoding.ts";
import { getJourneyWeather } from "../lib/server/weather.ts";
import { geoCache, rateLimitedNominatimFetch } from "../lib/server/geo-cache.ts";
import { validateUpstreamUrl } from "../lib/server/ssrf-guard.ts";

test("Geospatial: Coordinate Validation", () => {
  // Valid coordinates
  assert.equal(isValidCoordinate(12.9915, 80.2337), true, "Chennai North Gate should be valid");
  assert.equal(isValidCoordinate(0, 0), true, "Origin (0,0) should be valid");
  assert.equal(isValidCoordinate(-90, -180), true, "Boundary (-90, -180) should be valid");
  assert.equal(isValidCoordinate(90, 180), true, "Boundary (90, 180) should be valid");

  // Invalid coordinates
  assert.equal(isValidCoordinate(91, 50), false, "Latitude > 90 must fail");
  assert.equal(isValidCoordinate(-91, 50), false, "Latitude < -90 must fail");
  assert.equal(isValidCoordinate(12, 181), false, "Longitude > 180 must fail");
  assert.equal(isValidCoordinate(12, -181), false, "Longitude < -180 must fail");
  assert.equal(isValidCoordinate(NaN, 50), false, "NaN latitude must fail");
  assert.equal(isValidCoordinate(12, Infinity), false, "Infinity longitude must fail");
  assert.equal(isValidCoordinate(null, 50), false, "Null latitude must fail");
  assert.equal(isValidCoordinate(undefined, undefined), false, "Undefined must fail");
  assert.equal(isValidCoordinate("12.9915", "80.2337"), false, "String coordinates must fail");
});

test("Geospatial: Haversine Distance Calculation", () => {
  // Same coordinates should have 0 distance
  assert.equal(haversineDistance(12.9915, 80.2337, 12.9915, 80.2337), 0);

  // Chennai North Gate (12.9915, 80.2337) to South Gate (12.9862, 80.2412) ~ 1.0 km
  const dist = haversineDistance(12.9915, 80.2337, 12.9862, 80.2412);
  assert.ok(dist >= 0.8 && dist <= 1.2, `Distance should be ~1.0 km, got ${dist}`);

  // Bengaluru IISc (13.0184, 77.5670) to Hostel Block D (12.9344, 77.6056) ~ 10.1 km
  const blrDist = haversineDistance(13.0184, 77.5670, 12.9344, 77.6056);
  assert.ok(blrDist >= 9.0 && blrDist <= 11.5, `Distance should be ~10 km, got ${blrDist}`);
});

test("Geospatial: Campus Zones Directory & Coordinate Bounds", () => {
  assert.ok(CAMPUS_ZONES.length >= 8, "Should have campus zones for all major campuses");

  for (const zone of CAMPUS_ZONES) {
    assert.ok(isValidCoordinate(zone.coordinates.lat, zone.coordinates.lng), `Zone ${zone.id} has invalid coordinates`);
    assert.ok(zone.name.length > 0, `Zone ${zone.id} missing name`);
    assert.ok(zone.city.length > 0, `Zone ${zone.id} missing city`);
    assert.ok(zone.landmarks.length > 0, `Zone ${zone.id} must have landmarks`);
  }

  const chennaiZones = getCampusZonesByCity("Chennai");
  assert.ok(chennaiZones.length >= 2, "Chennai should have at least 2 campus zones");
  assert.ok(chennaiZones.some((z) => z.id === "chennai-north-gate"));

  const kochiZones = getCampusZonesByCity("Kochi");
  assert.ok(kochiZones.length >= 2, "Kochi should have at least 2 campus zones");

  const zone = getCampusZoneById("blr-admin-ring");
  assert.ok(zone, "Should find Bengaluru admin ring zone");
  assert.equal(zone.city, "Bengaluru");

  // Nearest zone lookup with valid coords
  const nearest = findNearestCampusZone(12.991, 80.233, "Chennai");
  assert.ok(nearest, "Should find nearest zone");
  assert.equal(nearest.zone.id, "chennai-north-gate");
  assert.ok(nearest.distanceKm < 0.2, "Distance should be under 200m");

  // Nearest zone lookup with invalid coords returns null safely
  assert.equal(findNearestCampusZone(NaN, 80), null, "Invalid lat should return null");
  assert.equal(findNearestCampusZone(12, 200), null, "Invalid lng should return null");
});

test("Geospatial: GeoCache TTL and In-Memory Storage", () => {
  geoCache.clear();
  geoCache.set("test-key", { data: 123 }, 2); // 2s TTL
  assert.deepEqual(geoCache.get("test-key"), { data: 123 });
  assert.equal(geoCache.has("test-key"), true);

  // Missing key
  assert.equal(geoCache.get("non-existent"), null);
  assert.equal(geoCache.has("non-existent"), false);
});

test("Geospatial: Geocoding Query Validation & Minimum Length", async () => {
  // Queries shorter than 3 characters must be rejected early
  const shortResult1 = await searchLocation("", "Chennai");
  assert.deepEqual(shortResult1, []);

  const shortResult2 = await searchLocation("ab", "Chennai");
  assert.deepEqual(shortResult2, []);

  const whitespaceResult = await searchLocation("   ", "Chennai");
  assert.deepEqual(whitespaceResult, []);

  // Instant local campus zone match with >= 3 characters
  const results = await searchLocation("North Campus Gate", "Chennai");
  assert.ok(results.length > 0, "Should find North Campus Gate");
  assert.equal(results[0].isCampusZone, true);
  assert.ok(isValidCoordinate(results[0].lat, results[0].lng));
});

test("Geospatial: Reverse Geocoding with Campus Zone Awareness", async () => {
  // Near Chennai North Gate (12.9915, 80.2337)
  const result = await reverseGeocode(12.9915, 80.2337);
  assert.ok(result, "Should return reverse geocode result");
  assert.ok(result.displayName.includes("North Campus Gate"), "Should identify nearest campus zone");
  assert.equal(result.nearestCampusZone?.id, "chennai-north-gate");
});

test("Geospatial: Route Classification (Actual vs. Estimated)", async () => {
  const origin = { lat: 12.9915, lng: 80.2337 }; // North Gate
  const destination = { lat: 12.9862, lng: 80.2412 }; // South Gate

  const route2W = await calculateRoute(origin, destination, "2-Wheeler");
  assert.ok(route2W, "Should calculate route");
  assert.ok(route2W.distanceKm > 0, "Distance must be positive");
  assert.ok(route2W.durationMins > 0, "Duration must be positive");
  assert.ok(route2W.primaryGeometry.coordinates.length >= 2, "Geometry should contain coordinate points");

  // Validate routeType classification
  assert.ok(["actual", "estimated"].includes(route2W.routeType), `routeType must be actual or estimated, got ${route2W.routeType}`);
  assert.equal(typeof route2W.isEstimated, "boolean");

  if (route2W.routeType === "estimated") {
    assert.equal(route2W.isEstimated, true);
    assert.ok(route2W.formattedDistance.includes("Estimated"), "Estimated route must have formatted distance indicating estimate");
  } else {
    assert.equal(route2W.isEstimated, false);
  }

  // Check intra-zone zero distance handling
  const samePointRoute = await calculateRoute(origin, origin, "2-Wheeler");
  assert.equal(samePointRoute.distanceKm, 0.1);
  assert.equal(samePointRoute.durationMins, 1);
  assert.equal(samePointRoute.routeType, "actual");
});

test("Geospatial: Weather Intelligence & Non-Blocking Fallback", async () => {
  const weather = await getJourneyWeather(12.9915, 80.2337, "2-Wheeler");
  assert.ok(weather, "Should return weather structure");
  assert.ok(typeof weather.temperatureC === "number");
  assert.ok(typeof weather.conditionLabel === "string");
  assert.ok(["low", "moderate", "high"].includes(weather.rainRisk));
  assert.ok(["info", "warning", "caution"].includes(weather.advisoryType));
  assert.ok(weather.contextualAdvisory.length > 0);
  assert.ok(weather.attribution.length > 0);
});

test("Geospatial: Weather Advisory 2-Wheeler vs 4-Wheeler", async () => {
  const weather2W = await getJourneyWeather(12.9915, 80.2337, "2-Wheeler");
  const weather4W = await getJourneyWeather(12.9915, 80.2337, "4-Wheeler");
  assert.ok(weather2W, "Should return 2-Wheeler weather");
  assert.ok(weather4W, "Should return 4-Wheeler weather");
  assert.equal(weather2W.temperatureC, weather4W.temperatureC);
});

test("Geospatial: Route Calculation Out-of-Bounds Rejection", async () => {
  await assert.rejects(
    async () => {
      await calculateRoute({ lat: 100, lng: 50 }, { lat: 12, lng: 80 }, "2-Wheeler");
    },
    /Invalid origin or destination coordinates/
  );
});

test("Geospatial: Reverse Geocoding Invalid Coordinates Rejection", async () => {
  await assert.rejects(
    async () => {
      await reverseGeocode(95, 200);
    },
    /Invalid latitude or longitude/
  );
});

test("Geospatial: SSRF Guard Upstream Host Allowlist", () => {
  // Approved hosts must succeed
  assert.ok(validateUpstreamUrl("https://api.openrouteservice.org/v2/directions"));
  assert.ok(validateUpstreamUrl("https://router.project-osrm.org/route/v1/driving"));
  assert.ok(validateUpstreamUrl("https://nominatim.openstreetmap.org/search"));
  assert.ok(validateUpstreamUrl("https://api.opencagedata.com/geocode/v1/json"));
  assert.ok(validateUpstreamUrl("https://api.open-meteo.com/v1/forecast"));
  assert.ok(validateUpstreamUrl("https://a.basemaps.cartocdn.com/light_all/1/1/1.png"));

  // Disallowed hosts (internal IP, local, or arbitrary third-party) must be blocked
  assert.throws(() => validateUpstreamUrl("http://169.254.169.254/latest/meta-data"), /SSRF Guard/);
  assert.throws(() => validateUpstreamUrl("http://localhost:3000/api/admin"), /SSRF Guard/);
  assert.throws(() => validateUpstreamUrl("http://127.0.0.1:8080"), /SSRF Guard/);
  assert.throws(() => validateUpstreamUrl("https://attacker-domain.evil/steal"), /SSRF Guard/);
  assert.throws(() => validateUpstreamUrl("ftp://api.openrouteservice.org"), /Disallowed protocol/);
});

test("Geospatial: Nominatim Rate-Limited Queue Interface & SSRF Rejection", async () => {
  assert.equal(typeof rateLimitedNominatimFetch, "function");
  await assert.rejects(
    async () => {
      await rateLimitedNominatimFetch("http://malicious-external-target.com/search");
    },
    /SSRF Guard/
  );
});

test("Geospatial: Security - Zero Private API Keys Leaked in Route Responses", async () => {
  const origin = { lat: 12.9915, lng: 80.2337 };
  const destination = { lat: 12.9862, lng: 80.2412 };
  const result = await calculateRoute(origin, destination, "2-Wheeler");

  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes("OPENROUTESERVICE_API_KEY"), false, "Must not leak env key name");
  assert.equal(serialized.includes("OPENCAGE_API_KEY"), false, "Must not leak env key name");
  assert.equal(serialized.includes("Bearer "), false, "Must not leak bearer tokens");
});
