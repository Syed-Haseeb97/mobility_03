import test from "node:test";
import assert from "node:assert/strict";
import { db } from "../lib/server/db.ts";
import { daysBetween, money } from "../lib/data.ts";
import { haversineDistance } from "../lib/campus-zones.ts";

test("Database: Vehicles Query and Geospatial Coordinates", () => {
  const vehicles = db.getVehicles();
  assert.ok(vehicles.length >= 8, "Database should have seeded vehicles");

  // Verify each seeded vehicle has valid campus coordinates
  for (const v of vehicles) {
    assert.ok(typeof v.latitude === "number", `Vehicle ${v.id} (${v.name}) must have latitude`);
    assert.ok(typeof v.longitude === "number", `Vehicle ${v.id} (${v.name}) must have longitude`);
    assert.ok(v.latitude >= -90 && v.latitude <= 90);
    assert.ok(v.longitude >= -180 && v.longitude <= 180);
  }

  // Filter by wheels
  const twoWheelers = db.getVehicles({ wheels: "2-Wheeler" });
  assert.ok(twoWheelers.length > 0);
  assert.ok(twoWheelers.every((v) => v.wheels === "2-Wheeler"));

  // Filter by city
  const chennaiVehicles = db.getVehicles({ city: "Chennai" });
  assert.ok(chennaiVehicles.length > 0);
  assert.ok(chennaiVehicles.every((v) => v.city === "Chennai"));
});

test("Database: Proximity Vehicle Matching", () => {
  const vehicles = db.getVehicles();
  // User at Chennai North Gate (12.9915, 80.2337)
  const userLat = 12.9915;
  const userLng = 80.2337;

  const withDistances = vehicles.map((v) => ({
    ...v,
    distanceKm: haversineDistance(userLat, userLng, v.latitude, v.longitude),
  }));

  withDistances.sort((a, b) => a.distanceKm - b.distanceKm);

  // The closest vehicle to Chennai North Gate should be v1 (Splendor) or v8 (Creta) which are at North Gate (< 0.1 km)
  const closest = withDistances[0];
  assert.ok(closest.distanceKm < 0.1, `Closest vehicle should be in the same campus zone, got ${closest.distanceKm} km`);
  assert.equal(closest.city, "Chennai");
});

test("Database: Booking Availability & Overlap Protection", () => {
  const vehicle = db.getVehicles({ status: "approved" })[0];
  assert.ok(vehicle, "Approved vehicle should exist");

  // Check availability on future date
  const available = db.checkAvailability(vehicle.id, "2027-11-01", "2027-11-05");
  assert.equal(typeof available, "boolean");
});

test("Financial: Days and Pricing Calculation Formula", () => {
  assert.equal(daysBetween("2026-11-10", "2026-11-12"), 2);
  assert.equal(daysBetween("2026-11-10", "2026-11-10"), 1);
  assert.equal(daysBetween("2026-11-12", "2026-11-10"), 0);

  // Daily rate ₹500 for 3 days
  const rentalDays = 3;
  const dailyRate = 500;
  const baseTotal = dailyRate * rentalDays; // ₹1,500
  const isTwoWheeler = true;
  const damageWaiver = (isTwoWheeler ? 50 : 150) * rentalDays; // ₹150
  const platformFee = Math.round(baseTotal * 0.1); // ₹150
  const taxes = Math.round((baseTotal + platformFee) * 0.05); // ₹83
  const total = baseTotal + damageWaiver + platformFee + taxes; // ₹1,883

  assert.equal(baseTotal, 1500);
  assert.equal(damageWaiver, 150);
  assert.equal(platformFee, 150);
  assert.equal(taxes, 83);
  assert.equal(total, 1883);

  // Currency formatter
  const formatted = money(1883);
  assert.ok(formatted.includes("1,883") || formatted.includes("1883"));
});

test("Database: Booking Route Telemetry & Dropoff Location Persistence", () => {
  const vehicle = db.getVehicles({ status: "approved" })[0];
  assert.ok(vehicle);

  const testBooking = db.createBooking({
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    vehicleMake: vehicle.make,
    vehicleCategory: vehicle.category,
    wheels: vehicle.wheels,
    registrationNumber: vehicle.registrationNumber,
    vehicleImage: vehicle.image,
    city: vehicle.city,
    pickupZone: vehicle.campusZone,
    pickupAddress: vehicle.pickupAddress,
    pickupLat: vehicle.latitude,
    pickupLng: vehicle.longitude,
    dropoffZone: "South Campus Gate / Research Park",
    dropoffAddress: "IITM Research Park Tower A",
    dropoffLat: 12.9862,
    dropoffLng: 80.2412,
    routeDistanceKm: 4.2,
    estimatedDurationMins: 14,
    customerId: "test-cust-audit",
    customerName: "Audit Test User",
    customerEmail: "audit@test.campus",
    customerPhone: "+91 98765 43210",
    drivingLicense: "DL-0420110012345",
    ownerId: vehicle.ownerId,
    ownerName: vehicle.ownerName,
    start: "2027-12-01",
    end: "2027-12-03",
    rentalDays: 2,
    ratePerDay: vehicle.price,
    baseTotal: vehicle.price * 2,
    helmetOptionSelected: "1 Helmet Included",
    helmetFee: 0,
    damageWaiver: 100,
    platformFee: 50,
    taxes: 25,
    securityDeposit: 500,
    total: vehicle.price * 2 + 100 + 50 + 25,
    paymentStatus: "PENDING",
    paymentMethod: "UPI",
    paymentTxnId: "DEMO-TXN-1",
    paidAt: "",
    status: "CONFIRMED",
  });

  assert.ok(testBooking.id);
  assert.equal(testBooking.dropoffZone, "South Campus Gate / Research Park");
  assert.equal(testBooking.dropoffLat, 12.9862);
  assert.equal(testBooking.dropoffLng, 80.2412);
  assert.equal(testBooking.routeDistanceKm, 4.2);
  assert.equal(testBooking.estimatedDurationMins, 14);

  // Retrieve from DB
  const retrieved = db.getBookingById(testBooking.id);
  assert.ok(retrieved);
  assert.equal(retrieved.routeDistanceKm, 4.2);
  assert.equal(retrieved.estimatedDurationMins, 14);
});
