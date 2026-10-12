import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const vehicle = db.getVehicleById(id);

  if (!vehicle || vehicle.status !== "approved") {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  const demoAccessAllowed =
    process.env.NODE_ENV !== "production" ||
    process.env.MOBILITY_ENABLE_UNSAFE_DEMO_MODE === "true";
  const publicVehicle = demoAccessAllowed
    ? vehicle
    : {
        ...vehicle,
        registrationNumber: vehicle.rcVerified ? vehicle.registrationNumber : "",
        insuranceValidTill: vehicle.insuranceVerified ? vehicle.insuranceValidTill : "",
      };

  return NextResponse.json({ vehicle: publicVehicle });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = db.getVehicleById(id);
    if (!existing) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    if (existing.status === "pending_review" && body.status === "approved") {
      return NextResponse.json(
        { error: "A host cannot approve their own listing. Wait for the review process." },
        { status: 403 }
      );
    }
    if (body.rcVerified === true || body.insuranceVerified === true) {
      return NextResponse.json(
        { error: "Document verification can only be recorded by an authorized review process." },
        { status: 403 }
      );
    }

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
  const { id } = await params;
  const updated = db.setVehicleStatus(id, "inactive");

  if (!updated) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  return NextResponse.json({ vehicle: updated, success: true });
}
