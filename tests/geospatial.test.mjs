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
import { geoCache } from "../lib/server/geo-cache.ts";

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

test("Geospatial: Campus Zones Directory", () => {
  assert.ok(CAMPUS_ZONES.length >= 8, "Should have campus zones for all major campuses");

  const chennaiZones = getCampusZonesByCity("Chennai");
  assert.ok(chennaiZones.length >= 2, "Chennai should have at least 2 campus zones");
  assert.ok(chennaiZones.some((z) => z.id === "chennai-north-gate"));

  const kochiZones = getCampusZonesByCity("Kochi");
  assert.ok(kochiZones.length >= 2, "Kochi should have at least 2 campus zones");

  const zone = getCampusZoneById("blr-admin-ring");
  assert.ok(zone, "Should find Bengaluru admin ring zone");
  assert.equal(zone.city, "Bengaluru");

  // Nearest zone lookup
  const nearest = findNearestCampusZone(12.9910, 80.2330, "Chennai");
  assert.ok(nearest, "Should find nearest zone");
  assert.equal(nearest.zone.id, "chennai-north-gate");
  assert.ok(nearest.distanceKm < 0.2, "Distance should be under 200m");
});

test("Geospatial: GeoCache TTL and In-Memory Storage", () => {
  geoCache.clear();
  geoCache.set("test-key", { data: 123 }, 2); // 2s TTL
  assert.deepEqual(geoCache.get("test-key"), { data: 123 });

  // Missing key
  assert.equal(geoCache.get("non-existent"), null);
});

test("Geospatial: Geocoding and Landmark Search", async () => {
  // 1. Instant local campus zone match
  const results = await searchLocation("North Campus Gate", "Chennai");
  assert.ok(results.length > 0, "Should find North Campus Gate");
  assert.equal(results[0].isCampusZone, true);
  assert.ok(isValidCoordinate(results[0].lat, results[0].lng));

  // 2. Empty query handling
  const emptyResults = await searchLocation("", "Chennai");
  assert.deepEqual(emptyResults, []);
});

test("Geospatial: Reverse Geocoding with Campus Zone Awareness", async () => {
  // Near Chennai North Gate (12.9915, 80.2337)
  const result = await reverseGeocode(12.9915, 80.2337);
  assert.ok(result, "Should return reverse geocode result");
  assert.ok(result.displayName.includes("North Campus Gate"), "Should identify nearest campus zone");
  assert.equal(result.nearestCampusZone?.id, "chennai-north-gate");
});

test("Geospatial: Route Calculation with Road Curvature Factor", async () => {
  const origin = { lat: 12.9915, lng: 80.2337 }; // North Gate
  const destination = { lat: 12.9862, lng: 80.2412 }; // South Gate

  const route2W = await calculateRoute(origin, destination, "2-Wheeler");
  assert.ok(route2W, "Should calculate route");
  assert.ok(route2W.distanceKm > 0, "Distance must be positive");
  assert.ok(route2W.durationMins > 0, "Duration must be positive");
  assert.ok(route2W.primaryGeometry.coordinates.length >= 2, "Geometry should contain coordinate points");
  assert.ok(["openrouteservice", "osrm", "simulated_road_fallback"].includes(route2W.source));

  // Check intra-zone zero distance handling
  const samePointRoute = await calculateRoute(origin, origin, "2-Wheeler");
  assert.equal(samePointRoute.distanceKm, 0.1);
  assert.equal(samePointRoute.durationMins, 1);
});

test("Geospatial: Weather Intelligence (Open-Meteo & Fallback)", async () => {
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
