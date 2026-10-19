import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { blockUnconfiguredProductionAccess } from "@/lib/server/production-safety";

export async function GET(request: Request) {
  const blocked = blockUnconfiguredProductionAccess("Owner financial records");
  if (blocked) return blocked;

  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId") || "usr-host-1";

    const owner = db.getUserById(ownerId);
    const vehicles = db.getVehicles({ ownerId });
    const bookings = db.getBookings({ ownerId });
    const payouts = db.getPayouts(ownerId);

    // Financial calculations
    const grossBookingsAmount = bookings
      .filter((b) => b.status !== "CANCELLED")
      .reduce((sum, b) => sum + b.baseTotal, 0);

    const platformCommission = Math.round(grossBookingsAmount * 0.1); // 10%
    const totalEarnings = grossBookingsAmount - platformCommission;

    const settledAmount = payouts
      .filter((p) => p.status === "PROCESSED")
      .reduce((sum, p) => sum + p.netSettlement, 0);

    const requestedAmount = payouts
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + p.netSettlement, 0);

    const pendingSettlement = Math.max(0, totalEarnings - settledAmount - requestedAmount);

    const activeRentals = bookings.filter(
      (b) => b.status === "CONFIRMED" || b.status === "ACTIVE_TRIP"
    ).length;

    const completedRentals = bookings.filter((b) => b.status === "COMPLETED").length;

    return NextResponse.json({
      owner,
      vehiclesCount: vehicles.length,
      vehicles,
      bookings,
      payouts,
      metrics: {
        grossBookingsAmount,
        platformCommission,
        totalEarnings,
        settledAmount,
        pendingSettlement,
        activeRentals,
        completedRentals,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load owner stats" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const blocked = blockUnconfiguredProductionAccess("Payout processing");
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { ownerId, amount, destinationAccount, payoutMethod } = body;

    const payoutAmount = Number(amount);
    if (!ownerId || !Number.isFinite(payoutAmount) || payoutAmount < 500 || !Number.isInteger(payoutAmount)) {
      return NextResponse.json(
        { error: "Minimum payout settlement amount is ₹500." },
        { status: 400 }
      );
    }

    const owner = db.getUserById(ownerId);
    if (!owner || owner.role !== "owner") {
      return NextResponse.json({ error: "Owner account not found." }, { status: 404 });
    }
    const existingPayouts = db.getPayouts(ownerId);
    const eligibleGross = db.getBookings({ ownerId })
      .filter((booking) => booking.status !== "CANCELLED")
      .reduce((sum, booking) => sum + booking.baseTotal, 0);
    const alreadyRequestedGross = existingPayouts.reduce((sum, payout) => sum + payout.amount, 0);
    if (payoutAmount > Math.max(0, eligibleGross - alreadyRequestedGross)) {
      return NextResponse.json(
        { error: "Payout request exceeds the owner's available demo earnings." },
        { status: 409 }
      );
    }

    const ownerName = owner?.businessName || owner?.name || "Rental Partner";

    const payout = db.createPayout(
      ownerId,
      ownerName,
      payoutAmount,
      payoutMethod || "IMPS / UPI Direct Bank Transfer",
      destinationAccount || owner?.bankUpi || "registered-account@bank"
    );

    return NextResponse.json({
      payout,
      message: `Demo payout request for ₹${payout.netSettlement.toLocaleString("en-IN")} recorded. No funds were transferred.`,
      success: true,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to process payout" }, { status: 500 });
  }
}
