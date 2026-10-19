import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { blockUnconfiguredProductionAccess } from "@/lib/server/production-safety";

function toSafeProfile(profile: NonNullable<ReturnType<typeof db.getUserById>>) {
  const { drivingLicense: _drivingLicense, bankUpi: _bankUpi, ...safe } = profile;
  return safe;
}

// Default active session in cookies or header, or fallback to customer
export async function GET(request: Request) {
  const blocked = blockUnconfiguredProductionAccess("Session and account records");
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "usr-cust-1";
  const user = db.getUserById(userId) || db.getUserById("usr-cust-1");
  const allUsers = db.getUsers();

  return NextResponse.json({
    user: user ? toSafeProfile(user) : null,
    availableUsers: allUsers.map(toSafeProfile),
  });
}

export async function POST(request: Request) {
  const blocked = blockUnconfiguredProductionAccess("Demo session changes");
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { action, userId, updates } = body;

    if (action === "switch") {
      const user = db.getUserById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ user: toSafeProfile(user), success: true });
    }

    if (action === "updateKyc") {
      return NextResponse.json(
        { error: "KYC status can only be changed through the admin moderation workflow." },
        { status: 403 }
      );
    }

    if (action === "updateProfile") {
      const current = db.getUserById(userId);
      if (!current) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
        return NextResponse.json({ error: "Profile updates must be an object." }, { status: 400 });
      }
      const allowedFields = ["name", "email", "phone", "avatar", "campusAffiliation"] as const;
      const safeUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key]) => (allowedFields as readonly string[]).includes(key))
      );
      const updated = db.saveUser({ ...current, ...safeUpdates });
      return NextResponse.json({ user: toSafeProfile(updated), success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
