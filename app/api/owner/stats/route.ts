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
    const paidBookings = bookings.filter(
      (booking) => booking.paymentStatus === "PAID" && booking.status !== "CANCELLED"
    );
    const grossBookingsAmount = paidBookings.reduce((sum, booking) => sum + booking.baseTotal, 0);
    const platformCommission = paidBookings.reduce((sum, booking) => sum + booking.platformFee, 0);
    const totalEarnings = Math.max(0, grossBookingsAmount - platformCommission);

    const settledAmount = payouts
      .filter((p) => p.status === "PROCESSED")
      .reduce((sum, p) => sum + p.netSettlement, 0);

    const reservedPayouts = payouts
      .filter((payout) => payout.status === "PENDING")
      .reduce((sum, payout) => sum + payout.netSettlement, 0);
    const pendingSettlement = Math.max(0, totalEarnings - settledAmount - reservedPayouts);

    const activeRentals = paidBookings.filter(
      (booking) => booking.status === "CONFIRMED" || booking.status === "ACTIVE_TRIP"
    ).length;

    const completedRentals = paidBookings.filter((booking) => booking.status === "COMPLETED").length;

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

    if (!ownerId || !Number.isFinite(Number(amount)) || Number(amount) < 500) {
      return NextResponse.json(
        { error: "Enter a valid payout request of at least ₹500." },
        { status: 400 }
      );
    }

    const paidBookings = db.getBookings({ ownerId }).filter(
      (booking) => booking.paymentStatus === "PAID" && booking.status !== "CANCELLED"
    );
    const gross = paidBookings.reduce((sum, booking) => sum + booking.baseTotal, 0);
    const commission = paidBookings.reduce((sum, booking) => sum + booking.platformFee, 0);
    const payouts = db.getPayouts(ownerId);
    const settled = payouts.filter((payout) => payout.status === "PROCESSED").reduce((sum, payout) => sum + payout.netSettlement, 0);
    const reserved = payouts.filter((payout) => payout.status === "PENDING").reduce((sum, payout) => sum + payout.netSettlement, 0);
    const available = Math.max(0, gross - commission - settled - reserved);
    const estimatedNet = Number(amount) - Math.round(Number(amount) * 0.1);
    if (estimatedNet > available) {
      return NextResponse.json(
        { error: "This request exceeds the available payout estimate." },
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
      message: `Payout request for ₹${payout.netSettlement.toLocaleString("en-IN")} recorded for review. No money has been transferred in this demo.`,
      success: true,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to process payout" }, { status: 500 });
  }
}
