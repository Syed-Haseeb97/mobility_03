import { NextResponse } from "next/server";
import { db, BookingStatus } from "@/lib/server/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, status, handover, returnRecord, reason } = body;

    const existing = db.getBookingById(id);
    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 1. Cancellation workflow
    if (action === "cancel") {
      if (existing.status === "COMPLETED" || existing.status === "CANCELLED") {
        return NextResponse.json(
          { error: "Cannot cancel a booking that is already finished or cancelled." },
          { status: 400 }
        );
      }

      // Calculate refund according to formal cancellation policy:
      // If cancelled before start date: Full base amount refunded, nominal processing fee (5%)
      const refundAmount = Math.max(0, existing.total - Math.round(existing.platformFee * 0.5));

      const updated = db.updateBookingStatus(id, "CANCELLED", {
        cancellationReason: reason || "Cancelled by user via portal",
        refundAmount,
      });

      return NextResponse.json({
        booking: updated,
        message: `Booking cancelled. A refund of ₹${refundAmount.toLocaleString("en-IN")} has been initiated to your original payment method.`,
        success: true,
      });
    }

    // 2. Handover workflow (Owner checks in customer, verifies license & odometer)
    if (action === "handover") {
      const updated = db.updateBookingStatus(id, "ACTIVE_TRIP", {
        handover: {
          handoverTime: new Date().toISOString(),
          startingOdometer: Number(handover?.startingOdometer) || 10000,
          fuelBatteryLevel: handover?.fuelBatteryLevel || "100%",
          helmetsIssued: Number(handover?.helmetsIssued) || 1,
          licenseInspected: true,
          handoverNotes: handover?.handoverNotes || "Keys and vehicle handed over in verified condition.",
        },
      });

      return NextResponse.json({
        booking: updated,
        message: "Key handover logged. Trip is now active.",
        success: true,
      });
    }

    // 3. Return workflow (Owner marks vehicle returned & releases deposit)
    if (action === "return") {
      const updated = db.updateBookingStatus(id, "COMPLETED", {
        returnRecord: {
          returnTime: new Date().toISOString(),
          closingOdometer: Number(returnRecord?.closingOdometer) || 10050,
          damageObserved: returnRecord?.damageObserved || "None. Checked and approved.",
          depositReleased: true,
          depositDeduction: Number(returnRecord?.depositDeduction) || 0,
          depositReleaseNotes: returnRecord?.depositReleaseNotes || "Security deposit released in full.",
        },
      });

      return NextResponse.json({
        booking: updated,
        message: "Vehicle return complete. Deposit released.",
        success: true,
      });
    }

    // 4. Direct status transition if specified
    if (status) {
      const updated = db.updateBookingStatus(id, status as BookingStatus);
      return NextResponse.json({ booking: updated, success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
