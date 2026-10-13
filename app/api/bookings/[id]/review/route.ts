import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { blockUnconfiguredProductionAccess } from "@/lib/server/production-safety";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const blocked = blockUnconfiguredProductionAccess("Booking reviews");
  if (blocked) return blocked;

  try {
    const { id } = await params;
    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return NextResponse.json(
        { error: "Rating between 1 and 5 stars is required." },
        { status: 400 }
      );
    }

    const updated = db.addBookingReview(
      id,
      Number(rating),
      comment || "Great rental experience."
    );

    if (!updated) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      booking: updated,
      message: "Review submitted successfully.",
      success: true,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
