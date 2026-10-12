import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

// Default active session in cookies or header, or fallback to customer
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "usr-cust-1";
  const user = db.getUserById(userId) || db.getUserById("usr-cust-1");
  const allUsers = db.getUsers();

  return NextResponse.json({
    user,
    availableUsers: allUsers,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, updates } = body;

    if (action === "switch") {
      const user = db.getUserById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ user, success: true });
    }

    if (action === "updateKyc") {
      const updated = db.updateUserKyc(userId, updates.status, updates.docType);
      return NextResponse.json({ user: updated, success: true });
    }

    if (action === "updateProfile") {
      const current = db.getUserById(userId);
      if (!current) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      const updated = db.saveUser({ ...current, ...updates });
      return NextResponse.json({ user: updated, success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
