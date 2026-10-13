import { NextResponse } from "next/server";
import { db, VehicleListingStatus } from "@/lib/server/db";
import { blockUnconfiguredProductionAccess } from "@/lib/server/production-safety";
import { getIndiaDateString, isDateOnly } from "@/lib/date-utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city") || undefined;
    const category = searchParams.get("category") || undefined;
    const wheels = searchParams.get("wheels") || undefined;
    const isProduction = process.env.NODE_ENV === "production";
    const ownerId = isProduction ? undefined : searchParams.get("ownerId") || undefined;
    const statusParam = isProduction ? undefined : searchParams.get("status") as VehicleListingStatus | undefined;
    const search = searchParams.get("search") || undefined;
    const start = searchParams.get("start") || undefined;
    const end = searchParams.get("end") || undefined;

    if (start || end) {
      if (!start || !end || !isDateOnly(start) || !isDateOnly(end) || start < getIndiaDateString() || end <= start) {
        return NextResponse.json(
          { error: "Choose valid pickup and return dates, with return after pickup." },
          { status: 400 }
        );
      }
    }

    // For public browse, default to 'approved'. If ownerId or admin specified, allow viewing other statuses
    const status = statusParam || (ownerId ? undefined : "approved");

    let vehicles = db.getVehicles({
      city,
      category,
      wheels,
      ownerId,
      status,
      search,
    });

    if (start && end) {
      vehicles = vehicles.filter((vehicle) => db.checkAvailability(vehicle.id, start, end));
    }

    return NextResponse.json({ vehicles, count: vehicles.length });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const blocked = blockUnconfiguredProductionAccess("Vehicle listing creation");
  if (blocked) return blocked;

  try {
    const body = await request.json();

    const {
      ownerId,
      ownerName,
      name,
      make,
      year,
      category,
      wheels,
      city,
      pickupAddress,
      addressLine1,
      addressLine2,
      state,
      country,
      pinCode,
      price,
      hourlyPrice,
      deposit,
      seats,
      transmission,
      fuel,
      registrationNumber,
      insuranceValidTill,
      helmetOption,
      helmetCondition,
      image,
      additionalPhotos,
      description,
      hostNotes,
      guidelines,
    } = body;

    if (!name || !make || !price || Number(price) < 200) {
      return NextResponse.json(
        { error: "Make, model and a valid daily rate of at least ₹200 are required." },
        { status: 400 }
      );
    }

    if (!addressLine1 || !String(addressLine1).trim() || !city || !String(city).trim() || !state || !String(state).trim() || !country || !String(country).trim() || !pinCode || !String(pinCode).trim()) {
      return NextResponse.json({ error: "Address line 1, city, state, country and PIN code are required." }, { status: 400 });
    }

    const photos = Array.isArray(additionalPhotos) ? [image, ...additionalPhotos] : (image ? [image] : []);
    if (photos.length < 1 || photos.length > 5 || photos.some((photo) => typeof photo !== "string" || !photo.startsWith("data:image/jpeg;base64,") || photo.length > 2_000_000)) {
      return NextResponse.json({ error: "Upload between 1 and 5 valid vehicle photos." }, { status: 400 });
    }

    if (!description || description.trim().length < 15) {
      return NextResponse.json(
        { error: "Please provide a clear host description of at least 15 characters." },
        { status: 400 }
      );
    }

    const newVehicle = db.createVehicle({
      ownerId: ownerId || "usr-host-1",
      ownerName: ownerName || "Verified Host",
      ownerType: "commercial_rental",
      name: name.trim(),
      make: make.trim(),
      year: Number(year) || new Date().getFullYear(),
      category: category || "Bike",
      wheels: wheels || (category === "Bike" || category === "Scooter" ? "2-Wheeler" : "4-Wheeler"),
      city: String(city).trim(),
      state: String(state).trim(),
      country: String(country).trim(),
      pinCode: String(pinCode).trim(),
      addressLine1: String(addressLine1).trim(),
      addressLine2: String(addressLine2 || "").trim(),
      campusZone: "",
      pickupAddress: [String(addressLine1).trim(), String(addressLine2 || "").trim()].filter(Boolean).join(", "),
      price: Number(price),
      hourlyPrice: Number(hourlyPrice) || Math.round(Number(price) / 7),
      deposit: Number(deposit) || Math.round(Number(price) * 1.5),
      seats: Number(seats) || 2,
      transmission: transmission || "Manual",
      fuel: fuel || "Petrol",
      registrationNumber: registrationNumber || "TN 09 XX " + Math.floor(1000 + Math.random() * 9000),
      insuranceValidTill: insuranceValidTill || "2027-12-31",
      rcVerified: false,
      insuranceVerified: false,
      helmetOption: helmetOption || "1 Helmet Included",
      helmetCondition: helmetCondition || "Certified sanitized helmet provided",
      rating: 5.0,
      trips: 0,
      image: photos[0],
      additionalPhotos: photos.slice(1),
      description: description.trim(),
      hostNotes: hostNotes || "Handover against valid driving license.",
      guidelines: guidelines || "Follow designated campus speed limits and wear protective helmet.",
      status: "pending_review", // New listings must be reviewed before public booking
    });

    return NextResponse.json({ vehicle: newVehicle, success: true }, { status: 201 });
  } catch (err) {
    console.error("Create vehicle error:", err);
    return NextResponse.json({ error: "Failed to create vehicle listing" }, { status: 500 });
  }
}
