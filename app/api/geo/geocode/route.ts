import { NextResponse } from "next/server";
import { searchLocation } from "@/lib/server/geocoding";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const city = searchParams.get("city") || undefined;

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Query parameter 'q' must contain at least 2 characters." },
        { status: 400 }
      );
    }

    const results = await searchLocation(query, city);
    return NextResponse.json({
      results,
      count: results.length,
    });
  } catch (err) {
    console.error("Geocoding API error:", err);
    return NextResponse.json(
      { error: "Geocoding service unavailable" },
      { status: 500 }
    );
  }
}
