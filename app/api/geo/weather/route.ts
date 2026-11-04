import { NextResponse } from "next/server";
import { getJourneyWeather } from "@/lib/server/weather";
import { isValidCoordinate } from "@/lib/campus-zones";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng") || searchParams.get("lon");
    const wheels = (searchParams.get("wheels") || "2-Wheeler") as "2-Wheeler" | "4-Wheeler";

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

    const weather = await getJourneyWeather(lat, lng, wheels);
    return NextResponse.json({ weather });
  } catch (err) {
    console.error("Weather API error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve meteorological data" },
      { status: 500 }
    );
  }
}
