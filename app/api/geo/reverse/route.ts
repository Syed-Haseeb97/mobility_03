import { NextResponse } from "next/server";
import { reverseGeocode } from "@/lib/server/geocoding";
import { isValidCoordinate } from "@/lib/campus-zones";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng") || searchParams.get("lon");

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { error: "Parameters 'lat' and 'lng' are required." },
        { status: 400 }
      );
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (!isValidCoordinate(lat, lng)) {
      return NextResponse.json(
        { error: "Coordinates are out of valid range (-90..90, -180..180)." },
        { status: 400 }
      );
    }

    const result = await reverseGeocode(lat, lng);
    return NextResponse.json({ result });
  } catch (err) {
    console.error("Reverse geocoding error:", err);
    return NextResponse.json(
      { error: "Reverse geocoding failed" },
      { status: 500 }
    );
  }
}
