import { NextResponse } from "next/server";
import { db, BookingRecord } from "@/lib/server/db";
import { daysBetween } from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId") || undefined;
    const ownerId = searchParams.get("ownerId") || undefined;
    const vehicleId = searchParams.get("vehicleId") || undefined;

    const bookings = db.getBookings({
      customerId,
      ownerId,
      vehicleId,
    });

    return NextResponse.json({ bookings, count: bookings.length });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      vehicleId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      drivingLicense,
      start,
      end,
      helmetOptionSelected,
      paymentMethod,
    } = body;

    // 1. Validation
    if (!vehicleId || !start || !end) {
      return NextResponse.json(
        { error: "Vehicle, pickup date, and return date are required." },
        { status: 400 }
      );
    }

    if (!customerName?.trim() || !customerEmail?.includes("@")) {
      return NextResponse.json(
        { error: "Valid customer name and email address are required." },
        { status: 400 }
      );
    }

    if (!drivingLicense || drivingLicense.trim().length < 6) {
      return NextResponse.json(
        { error: "A valid Driving License (DL) number is mandatory for vehicle handover." },
        { status: 400 }
      );
    }

    const vehicle = db.getVehicleById(vehicleId);
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle listing not found." }, { status: 404 });
    }

    if (vehicle.status !== "approved") {
      return NextResponse.json(
        { error: "This vehicle is currently not available for bookings." },
        { status: 400 }
      );
    }

    // Validate strict date-only values before availability checks.
    const isValidDateOnly = (value: string) =>
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(value)) &&
      new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
    if (!isValidDateOnly(start) || !isValidDateOnly(end) || end <= start) {
      return NextResponse.json(
        { error: "Choose valid dates with the return date after pick-up." },
        { status: 400 }
      );
    }

    // 2. Rental duration is calculated before checking availability.
    const rentalDays = daysBetween(start, end);
    if (!Number.isFinite(rentalDays) || rentalDays <= 0) {
      return NextResponse.json(
        { error: "Return date must be after pick-up date." },
        { status: 400 }
      );
    }

    // 3. Availability protection. Date ranges use a return-date-exclusive model.
    const isAvailable = db.checkAvailability(vehicleId, start, end);
    if (!isAvailable) {
      return NextResponse.json(
        {
          error:
            "This vehicle is already booked for overlapping dates. Please select alternative dates or browse other vehicles in the area.",
        },
        { status: 409 }
      );
    }

    const ratePerDay = vehicle.price;
    const baseTotal = ratePerDay * rentalDays;
    const is2Wheeler = vehicle.wheels === "2-Wheeler";
    const damageWaiver = is2Wheeler ? 50 * rentalDays : 150 * rentalDays;
    const platformFee = Math.round(baseTotal * 0.1); // 10% platform fee
    const taxes = Math.round((baseTotal + platformFee) * 0.05); // 5% GST
    const securityDeposit = vehicle.deposit || (is2Wheeler ? 500 : 2000);
    const helmetFee = 0; // Helmets provided free with rental in campus policy

    const total = baseTotal + damageWaiver + platformFee + taxes;

    // Payment remains pending until a real provider confirms it.
    const selectedPaymentMethod: BookingRecord["paymentMethod"] =
      paymentMethod === "CARD" || paymentMethod === "NETBANKING" ? paymentMethod : "UPI";

    const booking: Omit<BookingRecord, "id" | "createdAt"> = {
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

      customerId: customerId || "usr-cust-1",
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone || "+91 98401 23456",
      drivingLicense: drivingLicense.trim().toUpperCase(),

      ownerId: vehicle.ownerId,
      ownerName: vehicle.ownerName,

      start,
      end,
      rentalDays,
      ratePerDay,
      baseTotal,
      helmetOptionSelected: helmetOptionSelected || vehicle.helmetOption || "1 Helmet Included",
      helmetFee,
      damageWaiver,
      platformFee,
      taxes,
      securityDeposit,
      total,

      paymentStatus: "PENDING",
      paymentMethod: selectedPaymentMethod,
      paymentTxnId: "",
      paidAt: "",

      status: "CONFIRMED",
    };

    const newBooking = db.createBooking(booking);

    return NextResponse.json(
      {
        booking: newBooking,
        message: "Booking request saved. Payment has not been processed in this demo; connect a payment provider before accepting real rentals.",
        success: true,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
