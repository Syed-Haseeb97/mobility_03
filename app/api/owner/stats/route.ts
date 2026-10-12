import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(request: Request) {
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

    const pendingSettlement = Math.max(0, totalEarnings - settledAmount);

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
  try {
    const body = await request.json();
    const { ownerId, amount, destinationAccount, payoutMethod } = body;

    if (!ownerId || !amount || Number(amount) < 500) {
      return NextResponse.json(
        { error: "Minimum payout settlement amount is ₹500." },
        { status: 400 }
      );
    }

    const owner = db.getUserById(ownerId);
    const ownerName = owner?.businessName || owner?.name || "Rental Partner";

    const payout = db.createPayout(
      ownerId,
      ownerName,
      Number(amount),
      payoutMethod || "IMPS / UPI Direct Bank Transfer",
      destinationAccount || owner?.bankUpi || "registered-account@bank"
    );

    return NextResponse.json({
      payout,
      message: `Settlement of ₹${payout.netSettlement.toLocaleString("en-IN")} initiated (UTR: ${payout.utrNumber}).`,
      success: true,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to process payout" }, { status: 500 });
  }
}
