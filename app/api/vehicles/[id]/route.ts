import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { blockUnconfiguredProductionAccess } from "@/lib/server/production-safety";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const vehicle = db.getVehicleById(id);

  if (!vehicle || (process.env.NODE_ENV === "production" && vehicle.status !== "approved")) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  return NextResponse.json({ vehicle });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const blocked = blockUnconfiguredProductionAccess("Vehicle updates");
  if (blocked) return blocked;

  try {
    const { id } = await params;
    const body = await request.json();

    const updated = db.updateVehicle(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json({ vehicle: updated, success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const blocked = blockUnconfiguredProductionAccess("Vehicle deactivation");
  if (blocked) return blocked;

  const { id } = await params;
  const updated = db.setVehicleStatus(id, "inactive");

  if (!updated) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  return NextResponse.json({ vehicle: updated, success: true });
}
