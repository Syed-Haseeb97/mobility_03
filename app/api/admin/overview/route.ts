import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { blockUnconfiguredProductionAccess } from "@/lib/server/production-safety";

export async function GET(request: Request) {
  const blocked = blockUnconfiguredProductionAccess("Administrative records");
  if (blocked) return blocked;

  try {
    const store = db.getStore();

    const totalVehicles = store.vehicles.length;
    const pendingVehicles = store.vehicles.filter((v) => v.status === "pending_review").length;
    const approvedVehicles = store.vehicles.filter((v) => v.status === "approved").length;

    const totalBookings = store.bookings.length;
    const totalGrossRevenue = store.bookings
      .filter((b) => b.status !== "CANCELLED")
      .reduce((sum, b) => sum + b.total, 0);

    const platformCommissionCollected = store.bookings
      .filter((b) => b.status !== "CANCELLED")
      .reduce((sum, b) => sum + b.platformFee, 0);

    const pendingKycUsers = store.users.filter((u) => u.kycStatus === "pending").length;

    return NextResponse.json({
      metrics: {
        totalVehicles,
        pendingVehicles,
        approvedVehicles,
        totalBookings,
        totalGrossRevenue,
        platformCommissionCollected,
        pendingKycUsers,
        totalUsers: store.users.length,
      },
      vehicles: store.vehicles,
      bookings: store.bookings,
      users: store.users,
      payouts: store.payouts,
      disputes: store.disputes,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load admin overview" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const blocked = blockUnconfiguredProductionAccess("Administrative actions");
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { action, vehicleId, userId, disputeId, status, reason, notes } = body;

    // 1. Moderate vehicle listing
    if (action === "moderateVehicle") {
      const updated = db.setVehicleStatus(vehicleId, status, reason);
      if (!updated) {
        return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
      }
      return NextResponse.json({
        vehicle: updated,
        message: `Vehicle listing marked as ${status}.`,
        success: true,
      });
    }

    // 2. Moderate user KYC
    if (action === "moderateKyc") {
      const updated = db.updateUserKyc(userId, status);
      if (!updated) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({
        user: updated,
        message: `User verification updated to ${status}.`,
        success: true,
      });
    }

    // 3. Resolve dispute
    if (action === "resolveDispute") {
      const updated = db.resolveDispute(disputeId, notes || "Resolved by administrator.");
      if (!updated) {
        return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
      }
      return NextResponse.json({
        dispute: updated,
        message: "Dispute marked as resolved.",
        success: true,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to execute admin action" }, { status: 500 });
  }
}
