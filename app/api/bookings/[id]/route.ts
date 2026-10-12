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

      // Calculate an estimate only. This demo does not execute refunds.
      const refundAmount =
        existing.paymentStatus === "PAID"
          ? Math.max(0, existing.total - Math.round(existing.platformFee * 0.5))
          : undefined;

      const updated = db.updateBookingStatus(id, "CANCELLED", {
        cancellationReason: reason || "Cancelled by user via portal",
        ...(refundAmount !== undefined ? { refundAmount } : {}),
      });

      const message =
        refundAmount !== undefined
          ? `Booking cancelled. Estimated refund: ₹${refundAmount.toLocaleString("en-IN")}. Provider processing is still required; this demo does not issue refunds.`
          : existing.paymentStatus === "PENDING"
            ? "Booking request cancelled. No payment was collected, so no refund is due."
            : "Booking cancelled. No automatic refund was processed.";

      return NextResponse.json({ booking: updated, message, success: true });
    }

    // 2. Handover workflow (Owner checks in customer, verifies license & odometer)
    if (action === "handover") {
      const updated = db.updateBookingStatus(id, "ACTIVE_TRIP", {
        handover: {
          handoverTime: new Date().toISOString(),
          startingOdometer: Number(handover?.startingOdometer) || undefined,
          fuelBatteryLevel: handover?.fuelBatteryLevel || "Not recorded",
          helmetsIssued: Number(handover?.helmetsIssued) || undefined,
          licenseInspected: handover?.licenseInspected === true,
          handoverNotes: handover?.handoverNotes || "No handover notes recorded.",
        },
      });

      return NextResponse.json({
        booking: updated,
        message: "Handover recorded. Confirm the recorded checklist before treating the trip as verified.",
        success: true,
      });
    }

    // 3. Return workflow (Owner marks vehicle returned & releases deposit)
    if (action === "return") {
      const updated = db.updateBookingStatus(id, "COMPLETED", {
        returnRecord: {
          returnTime: new Date().toISOString(),
          closingOdometer: Number(returnRecord?.closingOdometer) || undefined,
          damageObserved: returnRecord?.damageObserved || "Not recorded",
          depositReleased: false,
          depositDeduction: Number(returnRecord?.depositDeduction) || 0,
          depositReleaseNotes: returnRecord?.depositReleaseNotes || "Release pending; no transfer is performed by this demo.",
        },
      });

      return NextResponse.json({
        booking: updated,
        message: "Vehicle return recorded. Deposit release is pending manual/provider processing; this demo does not transfer funds.",
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
