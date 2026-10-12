"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  FileText,
  XCircle,
  Star,
  CheckCircle2,
  AlertCircle,
  HardHat,
  Printer,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { money, type Booking } from "@/lib/data";
import { useSession } from "@/components/session-provider";

export default function BookingsPage() {
  const { currentUser } = useSession();
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"ALL" | "CONFIRMED" | "ACTIVE_TRIP" | "COMPLETED" | "CANCELLED">("ALL");

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState<Booking | null>(null);

  // Review Modal
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Cancellation State
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const customerId = currentUser?.id || "usr-cust-1";
      const res = await fetch(`/api/bookings?customerId=${customerId}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.bookings || []);
      }
    } catch (err) {
      console.error("Failed to load customer bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentUser]);

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Are you sure you wish to cancel this reservation according to campus refund policy?")) {
      return;
    }
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", reason: "Cancelled by customer via personal portal" }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionNotice(data.message || "Booking successfully cancelled.");
        fetchBookings();
      } else {
        alert(data.error || "Unable to cancel booking.");
      }
    } catch (err) {
      alert("Network error cancelling reservation.");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${reviewBooking.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: reviewText }),
      });
      if (res.ok) {
        setActionNotice("Review submitted successfully! Thank you for rating your ride.");
        setReviewBooking(null);
        setReviewText("");
        fetchBookings();
      } else {
        alert("Failed to submit review.");
      }
    } catch {
      alert("Error submitting review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const filtered = items.filter((b) => {
    if (filterTab === "ALL") return true;
    return b.status === filterTab;
  });

  return (
    <main className="page-shell">
      <div className="page-top">
        <div>
          <div className="eyebrow">Customer Account / Travel History</div>
          <h1 className="page-heading">
            My Rentals &amp;
            <br />
            Reservations.
          </h1>
          <p className="page-intro" style={{ marginTop: 14 }}>
            Monitor scheduled pickups, retrieve tax invoices and receipts, inspect handover
            details, and manage cancellation policies.
          </p>
        </div>

        <Link className="button-primary" href="/rent">
          Book Another Ride <ArrowUpRight size={15} />
        </Link>
      </div>

      {actionNotice && (
        <div
          style={{
            padding: "12px 18px",
            background: "#eff5db",
            border: "1px solid #c8d89e",
            color: "#2f3d13",
            marginBottom: 24,
            fontSize: 13,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{actionNotice}</span>
          <button
            onClick={() => setActionNotice(null)}
            style={{ background: "none", border: 0, fontWeight: 700, cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* FILTER TABS */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 28, borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
        {[
          { key: "ALL", label: `All Rentals (${items.length})` },
          { key: "CONFIRMED", label: `Upcoming (${items.filter((x) => x.status === "CONFIRMED").length})` },
          { key: "ACTIVE_TRIP", label: `Active (${items.filter((x) => x.status === "ACTIVE_TRIP").length})` },
          { key: "COMPLETED", label: `Completed (${items.filter((x) => x.status === "COMPLETED").length})` },
          { key: "CANCELLED", label: `Cancelled (${items.filter((x) => x.status === "CANCELLED").length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterTab(tab.key as any)}
            style={{
              padding: "7px 14px",
              background: filterTab === tab.key ? "#171915" : "#ffffff",
              color: filterTab === tab.key ? "#c8ff3a" : "#56584d",
              border: "1px solid var(--line)",
              fontFamily: "var(--mono)",
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 2,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="page-intro">Loading reservation records from secure database…</p>
      ) : filtered.length ? (
        <div style={{ display: "grid", gap: 16 }}>
          {filtered.map((b) => (
            <article className="booking-card" key={b.id} style={{ alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 500px" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span
                    className="pill"
                    style={{
                      background:
                        b.status === "CONFIRMED"
                          ? "#e7f4c9"
                          : b.status === "ACTIVE_TRIP"
                          ? "#d0ebff"
                          : b.status === "COMPLETED"
                          ? "#e2e8f0"
                          : "#fee2e2",
                      color:
                        b.status === "CONFIRMED"
                          ? "#354a10"
                          : b.status === "ACTIVE_TRIP"
                          ? "#0c4a6e"
                          : b.status === "COMPLETED"
                          ? "#334155"
                          : "#991b1b",
                    }}
                  >
                    {b.status}
                  </span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#74786d" }}>
                    Reference: <strong>{b.id}</strong>
                  </span>
                  {b.paymentTxnId && (
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#8a8f82" }}>
                      Txn: {b.paymentTxnId}
                    </span>
                  )}
                </div>

                <h3 style={{ marginTop: 12, fontSize: 20 }}>{b.vehicleName}</h3>

                <div className="muted" style={{ display: "flex", flexWrap: "wrap", gap: 14, margin: "6px 0 10px" }}>
                  <span>
                    <MapPin size={13} style={{ display: "inline", marginRight: 4 }} />
                    {b.pickupZone || b.city}
                  </span>
                  <span>
                    <CalendarDays size={13} style={{ display: "inline", marginRight: 4 }} />
                    {b.start} → {b.end}
                  </span>
                  {b.registrationNumber && (
                    <span style={{ fontFamily: "var(--mono)" }}>Plate: {b.registrationNumber}</span>
                  )}
                </div>

                <p className="muted" style={{ margin: "4px 0" }}>
                  Renter: <strong>{b.customerName || b.guest}</strong> · Partner:{" "}
                  <strong>{b.ownerName || "Authorized Fleet Partner"}</strong>
                </p>

                {b.helmetOptionSelected && (
                  <p className="muted" style={{ margin: "4px 0", color: "#546e14" }}>
                    <HardHat size={12} style={{ display: "inline", marginRight: 5 }} />
                    {b.helmetOptionSelected}
                  </p>
                )}

                {b.handover && (
                  <div
                    style={{
                      background: "#f8f9f4",
                      padding: "8px 12px",
                      border: "1px solid var(--line)",
                      fontSize: 11,
                      marginTop: 10,
                      color: "#4e5246",
                    }}
                  >
                    <strong>Handover Logged:</strong> Odometer {b.handover.startingOdometer} km · Fuel/Battery: {b.handover.fuelBatteryLevel}
                  </div>
                )}

                {b.review && (
                  <div
                    style={{
                      background: "#fdfdfa",
                      padding: "8px 12px",
                      border: "1px solid #dbe2cd",
                      fontSize: 11,
                      marginTop: 10,
                    }}
                  >
                    <div style={{ color: "#859c25", fontWeight: 700 }}>
                      ★ {b.review.rating} / 5 Customer Rating Submitted
                    </div>
                    <div style={{ color: "#55584e", marginTop: 2 }}>&ldquo;{b.review.comment}&rdquo;</div>
                  </div>
                )}
              </div>

              {/* RIGHT ACTIONS & INVOICE */}
              <div style={{ textAlign: "right", minWidth: 160 }}>
                <div className="price">{money(b.total)}</div>
                <div className="muted" style={{ fontSize: 10, textTransform: "uppercase" }}>
                  Payment: {b.paymentStatus || "PENDING"}
                </div>

                <div style={{ display: "grid", gap: 7, marginTop: 16 }}>
                  {/* View Invoice */}
                  <button
                    type="button"
                    onClick={() => setSelectedReceipt(b)}
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--line)",
                      padding: "6px 12px",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <FileText size={13} />
                    <span>View Receipt</span>
                  </button>

                  {/* Leave review if completed and not reviewed */}
                  {b.status === "COMPLETED" && !b.review && (
                    <button
                      type="button"
                      onClick={() => setReviewBooking(b)}
                      style={{
                        background: "#f0f5e3",
                        border: "1px solid #d4e0b8",
                        padding: "6px 12px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#4a5e1a",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <Star size={13} />
                      <span>Review Ride</span>
                    </button>
                  )}

                  {/* Cancel if confirmed */}
                  {b.status === "CONFIRMED" && (
                    <button
                      type="button"
                      onClick={() => handleCancelBooking(b.id)}
                      style={{
                        background: "#fff5f5",
                        border: "1px solid #fed7d7",
                        padding: "6px 12px",
                        fontSize: 11,
                        color: "#c53030",
                        cursor: "pointer",
                      }}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No bookings in this category.</h3>
          <p className="muted">
            You currently have no reservations matching this filter. Explore available vehicles to plan your next journey.
          </p>
          <Link className="button-primary" href="/rent" style={{ marginTop: 18 }}>
            Browse Campus Fleet <ArrowUpRight size={15} />
          </Link>
        </div>
      )}

      {/* RECEIPT / TAX INVOICE MODAL */}
      {selectedReceipt && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              maxWidth: 580,
              width: "100%",
              padding: 30,
              borderRadius: 4,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #171915", paddingBottom: 16 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-1px" }}>MOBILITY PLATFORM</div>
                <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: "#74786d" }}>
                  OFFICIAL TAX INVOICE &amp; RENTAL RECEIPT
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 13 }}>{selectedReceipt.id}</div>
                <div style={{ fontSize: 11, color: "#8a8f82" }}>Date: {selectedReceipt.start}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "20px 0", fontSize: 12 }}>
              <div>
                <strong style={{ fontSize: 11, color: "#838779", textTransform: "uppercase", fontFamily: "var(--mono)" }}>Renter</strong>
                <div style={{ fontWeight: 700, marginTop: 3 }}>{selectedReceipt.customerName || selectedReceipt.guest}</div>
                <div className="muted">{selectedReceipt.customerEmail}</div>
                <div className="muted">DL: {selectedReceipt.drivingLicense || "Verified on file"}</div>
              </div>
              <div>
                <strong style={{ fontSize: 11, color: "#838779", textTransform: "uppercase", fontFamily: "var(--mono)" }}>Partner / Provider</strong>
                <div style={{ fontWeight: 700, marginTop: 3 }}>{selectedReceipt.ownerName || "Authorized Partner"}</div>
                <div className="muted">Zone: {selectedReceipt.pickupZone || selectedReceipt.city}</div>
                <div className="muted">Vehicle Plate: {selectedReceipt.registrationNumber || "Inspected"}</div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "16px 0", margin: "18px 0", fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Vehicle Rental: {selectedReceipt.vehicleName}</span>
                <span>{money(selectedReceipt.baseTotal || selectedReceipt.total * 0.8)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#64685b" }}>
                <span>Damage Waiver &amp; Roadside Protection</span>
                <span>{money(selectedReceipt.damageWaiver || 100)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#64685b" }}>
                <span>Campus Platform Service Charge (10%)</span>
                <span>{money(selectedReceipt.platformFee || Math.round(selectedReceipt.total * 0.1))}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#64685b" }}>
                <span>GST (5%)</span>
                <span>{money(selectedReceipt.taxes || Math.round(selectedReceipt.total * 0.05))}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 15, paddingTop: 10, borderTop: "1px dashed var(--line)" }}>
                <span>{selectedReceipt.paymentStatus === "PAID" ? "Total Amount Paid" : "Estimated Booking Total"}</span>
                <span>{money(selectedReceipt.total)}</span>
              </div>
            </div>

            <div style={{ fontSize: 11, color: "#74786d", background: "#f8f9f2", padding: 12, borderRadius: 2 }}>
              <div>Payment Reference: {selectedReceipt.paymentTxnId || "No payment processed"}</div>
              <div>Payment Method: {selectedReceipt.paymentMethod || "UPI"} · Status: {selectedReceipt.paymentStatus || "PENDING"}</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  background: "#f0f2ea",
                  border: "1px solid #d3d8c8",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Printer size={14} /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="button-primary"
                style={{ padding: "10px 20px" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW SUBMISSION MODAL */}
      {reviewBooking && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              maxWidth: 480,
              width: "100%",
              padding: 28,
              borderRadius: 4,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div className="eyebrow">Rate Your Experience</div>
            <h2 style={{ fontSize: 22, margin: "8px 0 16px" }}>{reviewBooking.vehicleName}</h2>
            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                  Star Rating (1 to 5)
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      style={{
                        padding: "8px 14px",
                        background: rating >= s ? "#e8f2cb" : "#f1f3ee",
                        border: rating >= s ? "1px solid #9eb834" : "1px solid var(--line)",
                        color: rating >= s ? "#3f5412" : "#74786d",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      ★ {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                  Feedback &amp; Vehicle Condition Comments
                </label>
                <textarea
                  required
                  rows={4}
                  style={{ width: "100%", padding: 12, border: "1px solid var(--line)" }}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="How was the vehicle condition, battery/fuel, cleanliness, and host handover?"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                  style={{
                    padding: "10px 16px",
                    background: "none",
                    border: "1px solid var(--line)",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  Cancel
                </button>
                <button className="button-primary" type="submit" disabled={reviewSubmitting}>
                  {reviewSubmitting ? "Submitting…" : "Publish Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
