import { NextResponse } from "next/server";
import { calculateRoute } from "@/lib/server/routing";
import { isValidCoordinate } from "@/lib/campus-zones";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const originLat = parseFloat(searchParams.get("originLat") || "");
    const originLng = parseFloat(searchParams.get("originLng") || "");
    const destLat = parseFloat(searchParams.get("destLat") || "");
    const destLng = parseFloat(searchParams.get("destLng") || "");
    const wheels = (searchParams.get("wheels") || "2-Wheeler") as "2-Wheeler" | "4-Wheeler";

    if (
      !isValidCoordinate(originLat, originLng) ||
      !isValidCoordinate(destLat, destLng)
    ) {
      return NextResponse.json(
        { error: "Valid origin and destination coordinates are required." },
        { status: 400 }
      );
    }

    const route = await calculateRoute(
      { lat: originLat, lng: originLng },
      { lat: destLat, lng: destLng },
      wheels
    );

    return NextResponse.json({ route });
  } catch (err) {
    console.error("Routing API error:", err);
    return NextResponse.json(
      { error: "Failed to calculate road route" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, destination, wheels } = body;

    if (
      !origin ||
      !destination ||
      !isValidCoordinate(origin.lat, origin.lng) ||
      !isValidCoordinate(destination.lat, destination.lng)
    ) {
      return NextResponse.json(
        { error: "Valid origin and destination objects ({ lat, lng }) are required." },
        { status: 400 }
      );
    }

    const route = await calculateRoute(
      { lat: origin.lat, lng: origin.lng },
      { lat: destination.lat, lng: destination.lng },
      wheels === "4-Wheeler" ? "4-Wheeler" : "2-Wheeler"
    );

    return NextResponse.json({ route });
  } catch (err) {
    console.error("Routing POST API error:", err);
    return NextResponse.json(
      { error: "Route computation failed" },
      { status: 500 }
    );
  }
}
