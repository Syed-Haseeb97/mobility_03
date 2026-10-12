import { NextResponse } from "next/server";
import { db, VehicleListingStatus } from "@/lib/server/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city") || undefined;
    const category = searchParams.get("category") || undefined;
    const wheels = searchParams.get("wheels") || undefined;
    const ownerId = searchParams.get("ownerId") || undefined;
    const statusParam = searchParams.get("status") as VehicleListingStatus | undefined;
    const search = searchParams.get("search") || undefined;
    const start = searchParams.get("start") || undefined;
    const end = searchParams.get("end") || undefined;

    if (Boolean(start) !== Boolean(end)) {
      return NextResponse.json({ error: "Both pick-up and return dates are required for availability search." }, { status: 400 });
    }
    if (start && end) {
      const validDate = (value: string) =>
        /^\\d{4}-\\d{2}-\\d{2}$/.test(value) &&
        !Number.isNaN(Date.parse(value)) &&
        new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
      if (!validDate(start) || !validDate(end) || end <= start) {
        return NextResponse.json({ error: "Choose valid dates with the return date after pick-up." }, { status: 400 });
      }
    }

    // Public browsing only exposes approved listings.
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
      campusZone,
      pickupAddress,
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
      city: city || "Chennai",
      campusZone: campusZone || "North Campus Gate / Transit Hub",
      pickupAddress: pickupAddress || "Campus Transit Hub Bay",
      price: Number(price),
      hourlyPrice: Number(hourlyPrice) || Math.round(Number(price) / 7),
      deposit: Number(deposit) || Math.round(Number(price) * 1.5),
      seats: Number(seats) || 2,
      transmission: transmission || "Manual",
      fuel: fuel || "Petrol",
      registrationNumber: registrationNumber || "Pending verification",
      insuranceValidTill: insuranceValidTill || "",
      rcVerified: false,
      insuranceVerified: false,
      helmetOption: helmetOption || "1 Helmet Included",
      helmetCondition: helmetCondition || "Certified sanitized helmet provided",
      rating: 5.0,
      trips: 0,
      image: image || (wheels === "2-Wheeler" ? "/vehicles/hero-splendor.png" : "/vehicles/honda-city.png"),
      description: description.trim(),
      hostNotes: hostNotes || "Handover against valid driving license.",
      guidelines: guidelines || "Follow designated campus speed limits and wear protective helmet.",
      status: "pending_review", // New listings must be reviewed before they appear in public search
    });

    return NextResponse.json({ vehicle: newVehicle, success: true }, { status: 201 });
  } catch (err) {
    console.error("Create vehicle error:", err);
    return NextResponse.json({ error: "Failed to create vehicle listing" }, { status: 500 });
  }
}
