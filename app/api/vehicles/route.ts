import { NextResponse } from "next/server";
import { db, VehicleListingStatus } from "@/lib/server/db";
import { blockUnconfiguredProductionAccess, isProductionEnvironment } from "@/lib/server/production-safety";
import { getIndiaDateString, isDateOnly } from "@/lib/date-utils";
import { haversineDistance, isValidCoordinate, getCampusZoneById } from "@/lib/campus-zones";
import { searchLocation } from "@/lib/server/geocoding";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city") || undefined;
    const category = searchParams.get("category") || undefined;
    const wheels = searchParams.get("wheels") || undefined;
    const isProduction = isProductionEnvironment();
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

    // Public production browse may only expose approved vehicles.
    // Owner/status filtering remains available to local and preview demo flows.
    const status = statusParam || (ownerId ? undefined : "approved");

    let vehicles = db.getVehicles({
      city,
      category,
      wheels,
      ownerId,
      status,
      search,
    });

    // Unconfigured production must not expose checked-in demo inventory.
    if (isProduction) {
      vehicles = [];
    }

    if (start && end) {
      vehicles = vehicles.filter((vehicle) => db.checkAvailability(vehicle.id, start, end));
    }

    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const radiusParam = searchParams.get("radiusKm");
    const sortByParam = searchParams.get("sortBy");

    if (latParam && lngParam) {
      const userLat = parseFloat(latParam);
      const userLng = parseFloat(lngParam);
      if (isValidCoordinate(userLat, userLng)) {
        // Calculate coordinate distance for each vehicle with valid coordinates
        vehicles = vehicles.map((v) => {
          if (typeof v.latitude === "number" && typeof v.longitude === "number") {
            const distanceKm = haversineDistance(userLat, userLng, v.latitude, v.longitude);
            return { ...v, distanceKm };
          }
          return v;
        });

        // Filter by radius if specified
        if (radiusParam) {
          const maxRadius = parseFloat(radiusParam);
          if (!isNaN(maxRadius) && maxRadius > 0) {
            vehicles = vehicles.filter((v: any) => typeof v.distanceKm === "number" && v.distanceKm <= maxRadius);
          }
        }

        // Sort by distance if requested
        if (sortByParam === "distance" || sortByParam === "nearest") {
          vehicles.sort((a: any, b: any) => {
            const distA = typeof a.distanceKm === "number" ? a.distanceKm : 99999;
            const distB = typeof b.distanceKm === "number" ? b.distanceKm : 99999;
            return distA - distB;
          });
        }
      }
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
      helmetIncluded,
      showPickupAddress,
      showTransmission,
      showFuel,
      showSeats,
      helmetCondition,
      image,
      additionalPhotos,
      description,
      hostNotes,
      guidelines,
      latitude,
      longitude,
      campusZoneId,
      campusZone,
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

    let finalLat = typeof latitude === "number" && isValidCoordinate(latitude, longitude) ? latitude : undefined;
    let finalLng = typeof longitude === "number" && isValidCoordinate(latitude, longitude) ? longitude : undefined;
    let finalZone = campusZone || "";

    if (campusZoneId) {
      const matchedZone = getCampusZoneById(campusZoneId);
      if (matchedZone) {
        finalZone = matchedZone.name;
        if (finalLat === undefined || finalLng === undefined) {
          finalLat = matchedZone.coordinates.lat;
          finalLng = matchedZone.coordinates.lng;
        }
      }
    }

    if (finalLat === undefined || finalLng === undefined) {
      try {
        const geoResults = await searchLocation(
          `${String(addressLine1).trim()}, ${String(city).trim()}`,
          String(city).trim()
        );
        if (geoResults.length > 0) {
          finalLat = geoResults[0].lat;
          finalLng = geoResults[0].lng;
          if (!finalZone && geoResults[0].isCampusZone) {
            finalZone = geoResults[0].shortName;
          }
        }
      } catch (err) {
        console.warn("Auto-geocoding listing failed:", err);
      }
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
      campusZone: finalZone,
      campusZoneId: campusZoneId || undefined,
      latitude: finalLat,
      longitude: finalLng,
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
      helmetOption: helmetIncluded ? "1 Helmet Included" : "Not Applicable",
      helmetIncluded: Boolean(helmetIncluded),
      showPickupAddress: Boolean(showPickupAddress),
      showTransmission: Boolean(showTransmission),
      showFuel: Boolean(showFuel),
      showSeats: Boolean(showSeats),
      helmetCondition: helmetIncluded ? (helmetCondition || "Certified sanitized helmet provided") : undefined,
      rating: 0,
      trips: 0,
      image: photos[0],
      additionalPhotos: photos.slice(1),
      description: description.trim(),
      hostNotes: hostNotes || "Handover against valid driving license.",
      guidelines: guidelines || "Follow designated campus speed limits and wear protective helmet.",
      status: "pending_review",
    });

    return NextResponse.json({ vehicle: newVehicle, success: true }, { status: 201 });
  } catch (err) {
    console.error("Create vehicle error:", err);
    return NextResponse.json({ error: "Failed to create vehicle listing" }, { status: 500 });
  }
}
