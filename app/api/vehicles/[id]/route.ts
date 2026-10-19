import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { blockUnconfiguredProductionAccess, isDeployedEnvironment, isProductionEnvironment, isPublicDemoMode } from "@/lib/server/production-safety";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Unconfigured production must not expose the checked-in demo store at all.
  // This keeps direct-ID lookups consistent with the production browse endpoint.
  if (isProductionEnvironment()) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  const vehicle = db.getVehicleById(id);

  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }
  if (isDeployedEnvironment() && (!isPublicDemoMode() || vehicle.status !== "approved")) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  return NextResponse.json({ vehicle: toPublicVehicle(vehicle) });
}

function toPublicVehicle(vehicle: NonNullable<ReturnType<typeof db.getVehicleById>>) {
  const {
    registrationNumber: _registrationNumber,
    pickupAddress: _pickupAddress,
    addressLine1: _addressLine1,
    addressLine2: _addressLine2,
    pinCode: _pinCode,
    ownerId: _ownerId,
    ...publicVehicle
  } = vehicle;
  return publicVehicle;
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
    const editableFields = [
      "name", "make", "year", "category", "wheels", "city", "campusZone",
      "pickupAddress", "addressLine1", "addressLine2", "state", "country",
      "pinCode", "price", "hourlyPrice", "deposit", "seats", "transmission",
      "fuel", "helmetOption", "helmetCondition", "image", "additionalPhotos",
      "showPickupAddress", "showTransmission", "showFuel", "showSeats",
      "helmetIncluded", "description", "hostNotes", "guidelines",
    ] as const;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "A vehicle update object is required." }, { status: 400 });
    }
    const updates = Object.fromEntries(
      Object.entries(body).filter(([key]) => (editableFields as readonly string[]).includes(key))
    );
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No editable vehicle fields were provided." }, { status: 400 });
    }

    const updated = db.updateVehicle(id, updates);
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
