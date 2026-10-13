"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CarFront,
  IndianRupee,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Key,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Banknote,
  Send,
  HardHat,
  MapPin,
} from "lucide-react";
import { money, type Booking, type Vehicle } from "@/lib/data";
import { useSession } from "@/components/session-provider";

export default function HostDashboard() {
  const { currentUser } = useSession();
  const isDemoEnvironment = process.env.NODE_ENV !== "production";
  const [data, setData] = useState<{
    metrics: {
      grossBookingsAmount: number;
      platformCommission: number;
      totalEarnings: number;
      settledAmount: number;
      pendingSettlement: number;
      activeRentals: number;
      completedRentals: number;
    };
    vehicles: Vehicle[];
    bookings: Booking[];
    payouts: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "handovers" | "payouts">("overview");

  // Handover modal state
  const [handoverBooking, setHandoverBooking] = useState<Booking | null>(null);
  const [startingOdo, setStartingOdo] = useState("12500");
  const [fuelBattery, setFuelBattery] = useState("100%");
  const [helmetsGiven, setHelmetsGiven] = useState("1");
  const [handoverNotes, setHandoverNotes] = useState("Vehicle clean, helmet provided, DL checked.");

  // Return modal state
  const [returnBooking, setReturnBooking] = useState<Booking | null>(null);
  const [closingOdo, setClosingOdo] = useState("12620");
  const [damageNotes, setDamageNotes] = useState("None, clean return.");

  // Payout request modal state
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("1500");
  const [payoutDestination, setPayoutDestination] = useState(
    currentUser?.bankUpi || "juniperhire@icici"
  );
  const [payoutNotice, setPayoutNotice] = useState<string | null>(null);

  const fetchHostData = async () => {
    setLoading(true);
    try {
      const ownerId = currentUser?.id || "usr-host-1";
      const res = await fetch(`/api/owner/stats?ownerId=${ownerId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load host stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDemoEnvironment) fetchHostData();
  }, [currentUser]);

  const handleExecuteHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverBooking) return;
    try {
      const res = await fetch(`/api/bookings/${handoverBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "handover",
          handover: {
            startingOdometer: Number(startingOdo),
            fuelBatteryLevel: fuelBattery,
            helmetsIssued: Number(helmetsGiven),
            handoverNotes,
          },
        }),
      });
      if (res.ok) {
        setHandoverBooking(null);
        fetchHostData();
      }
    } catch {
      alert("Error logging handover");
    }
  };

  const handleExecuteReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnBooking) return;
    try {
      const res = await fetch(`/api/bookings/${returnBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "return",
          returnRecord: {
            closingOdometer: Number(closingOdo),
            damageObserved: damageNotes,
            depositReleased: true,
          },
        }),
      });
      if (res.ok) {
        setReturnBooking(null);
        fetchHostData();
      }
    } catch {
      alert("Error completing vehicle return");
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/owner/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: currentUser?.id || "usr-host-1",
          amount: Number(payoutAmount),
          destinationAccount: payoutDestination,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setPayoutNotice(json.message);
        setShowPayoutModal(false);
        fetchHostData();
      } else {
        alert(json.error || "Failed to request payout");
      }
    } catch {
      alert("Network error processing payout");
    }
  };

  if (!isDemoEnvironment) {
    return (
      <main className="page-shell">
        <div className="page-top">
          <div>
            <div className="eyebrow">Partner Operations / Host Studio</div>
            <h1 className="page-heading">Partner tools are in preview.</h1>
            <p className="page-intro">
              Vehicle management, trip handovers, and payouts will be available after
              secure partner accounts and persistent storage are configured.
            </p>
          </div>
        </div>
        <div className="empty-state" role="status">
          <h3>Host management is unavailable in this preview.</h3>
          <p className="muted">Review the partner onboarding information for current availability.</p>
          <Link className="button-primary" href="/list-your-vehicle" style={{ marginTop: 18 }}>
            Partner onboarding preview
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-top">
        <div>
          <div className="eyebrow">Partner Operations / Host Studio</div>
          <h1 className="page-heading">
            {currentUser?.businessName || currentUser?.name || "Host Studio"}.
          </h1>
          <p className="page-intro">
            Comprehensive command center for vehicle listings, active trip handovers,
            rental revenue breakdown, and institutional settlements.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={() => setShowPayoutModal(true)}
            style={{
              padding: "13px 18px",
              background: "#ffffff",
              border: "1px solid var(--line)",
              fontFamily: "var(--mono)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Banknote size={15} /> Request Settlement
          </button>
          <Link className="button-primary" href="/host/add-vehicle">
            Add a Vehicle <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>

      {payoutNotice && (
        <div
          style={{
            padding: "12px 18px",
            background: "#eff5db",
            border: "1px solid #c8d89e",
            color: "#2f3d13",
            marginBottom: 20,
            fontSize: 13,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>{payoutNotice}</span>
          <button
            onClick={() => setPayoutNotice(null)}
            style={{ background: "none", border: 0, fontWeight: 700, cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="host-layout">
        {/* SIDEBAR NAVIGATION */}
        <nav className="host-side">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={activeTab === "overview" ? "active" : ""}
            style={{ textAlign: "left", background: "none", border: 0, cursor: "pointer" }}
          >
            Studio Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("handovers")}
            className={activeTab === "handovers" ? "active" : ""}
            style={{ textAlign: "left", background: "none", border: 0, cursor: "pointer" }}
          >
            Key Handover Desk
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payouts")}
            className={activeTab === "payouts" ? "active" : ""}
            style={{ textAlign: "left", background: "none", border: 0, cursor: "pointer" }}
          >
            Payouts &amp; Settlements
          </button>
          <Link href="/host/listings">Garage &amp; Listings</Link>
          <Link href="/host/add-vehicle">List New Vehicle</Link>
          <Link href="/rent/bookings">Customer Perspective</Link>
        </nav>

        {/* CONTENT AREA */}
        <div className="host-content">
          {/* STATS OVERVIEW CARDS */}
          <div className="host-stats" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            <div className="host-stat">
              <span>
                <CarFront size={13} style={{ display: "inline", marginRight: 5 }} />
                Garage Fleet
              </span>
              <strong>{data?.vehicles.length || 0}</strong>
              <small>Approved &amp; Active</small>
            </div>

            <div className="host-stat">
              <span>
                <CalendarCheck size={13} style={{ display: "inline", marginRight: 5 }} />
                Active Rentals
              </span>
              <strong>{data?.metrics.activeRentals || 0}</strong>
              <small>On Campus / Road</small>
            </div>

            <div className="host-stat">
              <span>
                <IndianRupee size={13} style={{ display: "inline", marginRight: 5 }} />
                Gross Rental Vol.
              </span>
              <strong style={{ fontSize: 22 }}>
                {money(data?.metrics.grossBookingsAmount || 0)}
              </strong>
              <small>Less 10% platform fee</small>
            </div>

            <div className="host-stat">
              <span>
                <Banknote size={13} style={{ display: "inline", marginRight: 5 }} />
                Pending Settlement
              </span>
              <strong style={{ fontSize: 22, color: "#4d6b13" }}>
                {money(data?.metrics.pendingSettlement || 0)}
              </strong>
              <small>Available to disburse</small>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div>
              <div className="section-head" style={{ marginTop: 28, marginBottom: 18 }}>
                <div>
                  <div className="eyebrow">Reservations &amp; Handovers</div>
                  <h2 style={{ fontSize: 24 }}>Bookings on your fleet.</h2>
                </div>
              </div>

              {data?.bookings.length ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {data.bookings.map((b) => (
                    <article className="booking-card" key={b.id} style={{ alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span className="pill">{b.status}</span>
                          <span style={{ fontFamily: "var(--mono)", fontSize: 11 }}>
                            Ref: <strong>{b.id}</strong>
                          </span>
                        </div>
                        <h3 style={{ marginTop: 8, fontSize: 18 }}>{b.vehicleName}</h3>
                        <p className="muted" style={{ margin: "4px 0" }}>
                          Guest: <strong>{b.customerName || b.guest}</strong> · Phone:{" "}
                          <strong>{b.customerPhone || "On file"}</strong> · DL:{" "}
                          <strong>{b.drivingLicense || "Verified"}</strong>
                        </p>
                        <p className="muted">
                          Dates: {b.start} → {b.end} · Pickup Zone: {b.pickupZone || b.city}
                        </p>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div className="price">{money(b.baseTotal || b.total)}</div>
                        <div className="muted" style={{ fontSize: 10 }}>
                          Net Earnings: {money(Math.round((b.baseTotal || b.total) * 0.9))}
                        </div>

                        {b.status === "CONFIRMED" && (
                          <button
                            type="button"
                            onClick={() => {
                              setHandoverBooking(b);
                            }}
                            className="button-primary"
                            style={{
                              marginTop: 10,
                              fontSize: 11,
                              padding: "8px 14px",
                              display: "inline-flex",
                            }}
                          >
                            <Key size={13} /> Log Key Handover
                          </button>
                        )}

                        {b.status === "ACTIVE_TRIP" && (
                          <button
                            type="button"
                            onClick={() => setReturnBooking(b)}
                            style={{
                              marginTop: 10,
                              fontSize: 11,
                              padding: "8px 14px",
                              background: "#171915",
                              color: "#c8ff3a",
                              border: 0,
                              borderRadius: 3,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <CheckCircle2 size={13} /> Complete Return
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h3>No bookings received yet.</h3>
                  <p className="muted">
                    Vehicles listed in your garage will appear here when students reserve them.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: KEY HANDOVER DESK */}
          {activeTab === "handovers" && (
            <div>
              <div className="section-head" style={{ marginTop: 28, marginBottom: 18 }}>
                <div>
                  <div className="eyebrow">Vehicle Inspection &amp; Key Dispatch</div>
                  <h2 style={{ fontSize: 24 }}>Handover Checklist Desk</h2>
                  <p className="muted">
                    Mandatory verification before vehicle release: inspect driving license, confirm
                    ISI helmet provision, and record starting odometer.
                  </p>
                </div>
              </div>

              {data?.bookings.filter((b) => b.status === "CONFIRMED" || b.status === "ACTIVE_TRIP").length ? (
                <div style={{ display: "grid", gap: 14 }}>
                  {data?.bookings
                    .filter((b) => b.status === "CONFIRMED" || b.status === "ACTIVE_TRIP")
                    .map((b) => (
                      <div
                        key={b.id}
                        style={{
                          background: "#ffffff",
                          border: "1px solid var(--line)",
                          padding: 20,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <span className="pill">{b.status}</span>
                            <h3 style={{ margin: "10px 0 4px" }}>
                              {b.vehicleName} · Ref: {b.id}
                            </h3>
                            <p className="muted">
                              Renter: <strong>{b.customerName || b.guest}</strong> · Driving License:{" "}
                              <strong>{b.drivingLicense || "Verified"}</strong>
                            </p>
                            <p className="muted">
                              Helmet Requested: {b.helmetOptionSelected || "1 Helmet Included"}
                            </p>
                          </div>

                          <div>
                            {b.status === "CONFIRMED" ? (
                              <button
                                type="button"
                                onClick={() => setHandoverBooking(b)}
                                className="button-primary"
                                style={{ fontSize: 11, padding: "8px 14px" }}
                              >
                                <Key size={13} /> Start Handover
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setReturnBooking(b)}
                                style={{
                                  fontSize: 11,
                                  padding: "8px 14px",
                                  background: "#171915",
                                  color: "#c8ff3a",
                                  border: 0,
                                  borderRadius: 3,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                Complete Return
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h3>All handovers are up to date.</h3>
                  <p className="muted">No pending pickups requiring verification at this moment.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PAYOUTS & SETTLEMENTS */}
          {activeTab === "payouts" && (
            <div>
              <div className="section-head" style={{ marginTop: 28, marginBottom: 18 }}>
                <div>
                  <div className="eyebrow">Financial Ledger &amp; Disbursals</div>
                  <h2 style={{ fontSize: 24 }}>Partner Settlements</h2>
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--line)",
                  padding: 22,
                  marginBottom: 24,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span className="eyebrow">Ready for Disbursal</span>
                    <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
                      {money(data?.metrics.pendingSettlement || 0)}
                    </div>
                    <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                      Direct IMPS / UPI transfer to {currentUser?.bankUpi || "registered bank account"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(true)}
                    className="button-primary"
                  >
                    Withdraw Settlement <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: 18, marginBottom: 12 }}>Disbursal Transaction History</h3>
              {data?.payouts.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {data.payouts.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        background: "#ffffff",
                        border: "1px solid var(--line)",
                        padding: 16,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{p.id} · {p.payoutMethod}</div>
                        <div className="muted" style={{ fontSize: 11, marginTop: 3 }}>
                          UTR: {p.utrNumber || "TRANSFERRED"} · {p.destinationAccount} · {p.createdAt.slice(0, 10)}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: "#3f5911" }}>
                          +{money(p.netSettlement)}
                        </div>
                        <span className="pill" style={{ background: "#e8f2cb", color: "#3f5911" }}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p className="muted">No payouts processed yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* HANDOVER MODAL */}
      {handoverBooking && (
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
              maxWidth: 500,
              width: "100%",
              padding: 28,
              borderRadius: 4,
            }}
          >
            <div className="eyebrow">Key Handover Verification</div>
            <h2 style={{ fontSize: 22, margin: "8px 0 16px" }}>
              Dispatch {handoverBooking.vehicleName}
            </h2>

            <form onSubmit={handleExecuteHandover}>
              <div className="form-stack">
                <label>
                  Starting Odometer Reading (km)
                  <input
                    type="number"
                    required
                    value={startingOdo}
                    onChange={(e) => setStartingOdo(e.target.value)}
                  />
                </label>

                <label>
                  Fuel / Battery Charge Level
                  <select
                    value={fuelBattery}
                    onChange={(e) => setFuelBattery(e.target.value)}
                  >
                    <option>100% Full</option>
                    <option>75% Level</option>
                    <option>50% Level</option>
                  </select>
                </label>

                <label>
                  ISI Certified Helmets Issued
                  <select
                    value={helmetsGiven}
                    onChange={(e) => setHelmetsGiven(e.target.value)}
                  >
                    <option>1 Certified Helmet</option>
                    <option>2 Certified Helmets</option>
                    <option>0 (Customer brought verified helmet / 4-Wheeler)</option>
                  </select>
                </label>

                <label>
                  Handover Inspection Notes
                  <input
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                  />
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
                <button
                  type="button"
                  onClick={() => setHandoverBooking(null)}
                  style={{ padding: "10px 16px", background: "none", border: "1px solid var(--line)", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button className="button-primary" type="submit">
                  Confirm Handover &amp; Start Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN MODAL */}
      {returnBooking && (
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
              maxWidth: 500,
              width: "100%",
              padding: 28,
              borderRadius: 4,
            }}
          >
            <div className="eyebrow">Vehicle Return Inspection</div>
            <h2 style={{ fontSize: 22, margin: "8px 0 16px" }}>
              Check-In {returnBooking.vehicleName}
            </h2>

            <form onSubmit={handleExecuteReturn}>
              <div className="form-stack">
                <label>
                  Closing Odometer Reading (km)
                  <input
                    type="number"
                    required
                    value={closingOdo}
                    onChange={(e) => setClosingOdo(e.target.value)}
                  />
                </label>

                <label>
                  Vehicle Condition &amp; Damage Inspection
                  <input
                    value={damageNotes}
                    onChange={(e) => setDamageNotes(e.target.value)}
                  />
                </label>

                <div
                  style={{
                    padding: 12,
                    background: "#f7f9f0",
                    border: "1px solid #d9e3c2",
                    fontSize: 12,
                    color: "#3f5018",
                  }}
                >
                  ✓ Security deposit of {money(returnBooking.securityDeposit || 500)} will be
                  automatically marked released to customer.
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
                <button
                  type="button"
                  onClick={() => setReturnBooking(null)}
                  style={{ padding: "10px 16px", background: "none", border: "1px solid var(--line)", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button className="button-primary" type="submit">
                  Mark Returned &amp; Release Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYOUT REQUEST MODAL */}
      {showPayoutModal && (
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
            }}
          >
            <div className="eyebrow">Partner Disbursal</div>
            <h2 style={{ fontSize: 22, margin: "8px 0 16px" }}>Request Settlement</h2>

            <form onSubmit={handleRequestPayout}>
              <div className="form-stack">
                <label>
                  Settlement Amount (₹)
                  <input
                    type="number"
                    min="500"
                    max={data?.metrics.pendingSettlement || 10000}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                  />
                </label>

                <label>
                  Destination Bank UPI / Account
                  <input
                    value={payoutDestination}
                    onChange={(e) => setPayoutDestination(e.target.value)}
                    placeholder="e.g. juniper@icici or 9840123456@paytm"
                  />
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  style={{ padding: "10px 16px", background: "none", border: "1px solid var(--line)", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button className="button-primary" type="submit">
                  Disburse Funds <ArrowUpRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
