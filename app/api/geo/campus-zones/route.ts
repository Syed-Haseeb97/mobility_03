import { NextResponse } from "next/server";
import { getCampusZonesByCity, getAllCampusZones } from "@/lib/campus-zones";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city") || undefined;
    const zones = getCampusZonesByCity(city);
    return NextResponse.json({
      zones,
      count: zones.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load campus pickup zones" },
      { status: 500 }
    );
  }
}
