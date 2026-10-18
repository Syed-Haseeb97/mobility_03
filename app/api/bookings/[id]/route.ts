import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { blockUnconfiguredProductionAccess } from "@/lib/server/production-safety";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const blocked = blockUnconfiguredProductionAccess("Booking records");
  if (blocked) return blocked;

  const { id } = await params;
  const booking = db.getBookingById(id);

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ booking });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const blocked = blockUnconfiguredProductionAccess("Booking changes, cancellations and handovers");
  if (blocked) return blocked;

  try {
    const { id } = await params;
    const body = await request.json();
    const { action, status, handover, returnRecord, reason } = body;

    const existing = db.getBookingById(id);
    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (action === "cancel") {
      if (["ACTIVE_TRIP", "RETURNED", "COMPLETED", "CANCELLED"].includes(existing.status)) {
        return NextResponse.json(
          { error: "Only a booking that has not started can be cancelled." },
          { status: 409 }
        );
      }

      const updated = db.updateBookingStatus(id, "CANCELLED", {
        cancellationReason: reason || "Cancelled via the demo portal",
      });

      return NextResponse.json({
        booking: updated,
        message: "Demo booking cancelled. No payment was processed, so no refund was initiated.",
        success: true,
        demo: true,
      });
    }

    if (action === "handover") {
      if (!["CONFIRMED", "HANDOVER_PENDING"].includes(existing.status)) {
        return NextResponse.json(
          { error: "Handover is only available for a confirmed booking that has not started." },
          { status: 409 }
        );
      }

      const startingOdometer = Number(handover?.startingOdometer);
      const helmetsIssued = Number(handover?.helmetsIssued);
      const fuelBatteryLevel = String(handover?.fuelBatteryLevel || "").trim();

      if (!Number.isFinite(startingOdometer) || startingOdometer < 0) {
        return NextResponse.json(
          { error: "Enter the actual starting odometer reading." },
          { status: 400 }
        );
      }
      if (!fuelBatteryLevel) {
        return NextResponse.json(
          { error: "Record the fuel or battery level before handing over the vehicle." },
          { status: 400 }
        );
      }
      if (handover?.licenseInspected !== true) {
        return NextResponse.json(
          { error: "Confirm that the renter’s driving licence was physically inspected." },
          { status: 400 }
        );
      }
      if (!Number.isInteger(helmetsIssued) || helmetsIssued < 0 || helmetsIssued > 4) {
        return NextResponse.json(
          { error: "Enter a valid number of helmets issued (0–4)." },
          { status: 400 }
        );
      }

      const updated = db.updateBookingStatus(id, "ACTIVE_TRIP", {
        handover: {
          handoverTime: new Date().toISOString(),
          startingOdometer,
          fuelBatteryLevel,
          helmetsIssued,
          licenseInspected: handover?.licenseInspected === true,
          handoverNotes: String(handover?.handoverNotes || "").trim(),
        },
      });

      return NextResponse.json({
        booking: updated,
        message: "Demo handover recorded. GPS tracking can now be started in the Android app.",
        success: true,
        demo: true,
      });
    }

    if (action === "return") {
      if (existing.status !== "ACTIVE_TRIP") {
        return NextResponse.json(
          { error: "Only an active trip can be checked in for return." },
          { status: 409 }
        );
      }

      const closingOdometer = Number(returnRecord?.closingOdometer);
      const startingOdometer = existing.handover?.startingOdometer;
      const damageObserved = String(returnRecord?.damageObserved || "").trim();
      const depositDeduction = Number(returnRecord?.depositDeduction ?? 0);

      if (!Number.isFinite(closingOdometer) || closingOdometer < 0) {
        return NextResponse.json(
          { error: "Enter the actual closing odometer reading." },
          { status: 400 }
        );
      }
      if (startingOdometer !== undefined && closingOdometer < startingOdometer) {
        return NextResponse.json(
          { error: "Closing odometer cannot be lower than the starting reading." },
          { status: 400 }
        );
      }
      if (!damageObserved) {
        return NextResponse.json(
          { error: "Record the vehicle condition or explicitly enter 'No damage observed'." },
          { status: 400 }
        );
      }
      if (!Number.isFinite(depositDeduction) || depositDeduction < 0 || depositDeduction > existing.securityDeposit) {
        return NextResponse.json(
          { error: "Deposit deduction must be between ₹0 and the listed security deposit." },
          { status: 400 }
        );
      }

      const updated = db.updateBookingStatus(id, "COMPLETED", {
        returnRecord: {
          returnTime: new Date().toISOString(),
          closingOdometer,
          damageObserved,
          // The prototype does not collect or move money. Never claim a real deposit was released.
          depositReleased: false,
          depositDeduction,
          depositReleaseNotes: "Demo record only. No security deposit was collected or released.",
        },
      });

      return NextResponse.json({
        booking: updated,
        message: "Demo return recorded. No deposit was collected or released.",
        success: true,
        demo: true,
      });
    }

    if (status) {
      return NextResponse.json(
        { error: "Direct status changes are disabled. Use the relevant booking workflow action." },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Booking update error:", err);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
