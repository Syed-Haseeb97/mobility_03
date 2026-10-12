"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileCheck2,
  AlertTriangle,
  IndianRupee,
  Users,
  CarFront,
  CalendarCheck,
  Search,
  Filter,
  Check,
  RotateCcw,
} from "lucide-react";
import { money } from "@/lib/data";
import { useSession } from "@/components/session-provider";

export default function AdminPage() {
  const { currentUser, switchUser } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "kyc" | "bookings" | "payouts">("listings");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/overview");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleModerateVehicle = async (vehicleId: string, status: "approved" | "rejected", reason?: string) => {
    try {
      const res = await fetch("/api/admin/overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "moderateVehicle", vehicleId, status, reason }),
      });
      const json = await res.json();
      if (res.ok) {
        setActionNotice(json.message);
        fetchAdminData();
      }
    } catch {
      alert("Error executing moderation action");
    }
  };

  const handleModerateKyc = async (userId: string, status: "verified" | "unverified") => {
    try {
      const res = await fetch("/api/admin/overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "moderateKyc", userId, status }),
      });
      const json = await res.json();
      if (res.ok) {
        setActionNotice(json.message);
        fetchAdminData();
      }
    } catch {
      alert("Error updating KYC");
    }
  };

  const isAdmin = currentUser?.role === "admin";

  return (
    <main className="page-shell">
      <div className="page-top">
        <div>
          <div className="eyebrow">Platform Governance / Operational Desk</div>
          <h1 className="page-heading">
            Campus Fleet
            <br />
            Administration.
          </h1>
          <p className="page-intro">
            Role-restricted control center for auditing regulatory compliance, authenticating
            partner documentation, approving listings, and managing financial settlement reconciliations.
          </p>
        </div>

        {!isAdmin && (
          <button
            type="button"
            onClick={() => switchUser("usr-admin-1")}
            className="button-primary"
            style={{ background: "#171915", color: "#c8ff3a" }}
          >
            <Shield size={14} /> Switch to Operations Admin Account
          </button>
        )}
      </div>

      {actionNotice && (
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
          <span>{actionNotice}</span>
          <button
            onClick={() => setActionNotice(null)}
            style={{ background: "none", border: 0, fontWeight: 700, cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* METRICS ROW */}
      <div className="host-stats" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="host-stat">
          <span>
            <CarFront size={13} style={{ display: "inline", marginRight: 5 }} />
            Total Fleet Listings
          </span>
          <strong>{data?.metrics.totalVehicles || 0}</strong>
          <small>{data?.metrics.approvedVehicles || 0} active / approved</small>
        </div>

        <div className="host-stat">
          <span>
            <CalendarCheck size={13} style={{ display: "inline", marginRight: 5 }} />
            Total Bookings
          </span>
          <strong>{data?.metrics.totalBookings || 0}</strong>
          <small>Authoritative reservations</small>
        </div>

        <div className="host-stat">
          <span>
            <IndianRupee size={13} style={{ display: "inline", marginRight: 5 }} />
            Gross Marketplace Vol.
          </span>
          <strong style={{ fontSize: 22 }}>
            {money(data?.metrics.totalGrossRevenue || 0)}
          </strong>
          <small>Reconciled platform gross</small>
        </div>

        <div className="host-stat">
          <span>
            <ShieldCheck size={13} style={{ display: "inline", marginRight: 5 }} />
            Platform Fees (10%)
          </span>
          <strong style={{ fontSize: 22, color: "#3f5412" }}>
            {money(data?.metrics.platformCommissionCollected || 0)}
          </strong>
          <small>Institutional revenue</small>
        </div>
      </div>

      {/* ADMIN WORKFLOW TABS */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", margin: "24px 0 20px", borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
        {[
          { key: "listings", label: `Vehicle Listings (${data?.vehicles?.length || 0})` },
          { key: "kyc", label: `User & Partner KYC (${data?.users?.length || 0})` },
          { key: "bookings", label: `Transactions & Bookings (${data?.bookings?.length || 0})` },
          { key: "payouts", label: `Disbursal Settlements (${data?.payouts?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: "8px 16px",
              background: activeTab === tab.key ? "#171915" : "#ffffff",
              color: activeTab === tab.key ? "#c8ff3a" : "#4e5145",
              border: "1px solid var(--line)",
              fontFamily: "var(--mono)",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="page-intro">Loading operational records…</p>
      ) : (
        <div>
          {/* TAB 1: VEHICLE MODERATION */}
          {activeTab === "listings" && (
            <div style={{ display: "grid", gap: 14 }}>
              {data?.vehicles.map((v: any) => (
                <article className="listing-row" key={v.id} style={{ alignItems: "flex-start" }}>
                  <div style={{ flex: "1 1 500px" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span
                        className="pill"
                        style={{
                          background: v.status === "approved" ? "#e6f4c5" : "#fee2e2",
                          color: v.status === "approved" ? "#31450f" : "#991b1b",
                        }}
                      >
                        {v.status}
                      </span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 11 }}>
                        Plate: <strong>{v.registrationNumber}</strong>
                      </span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#74786d" }}>
                        Host: <strong>{v.ownerName}</strong>
                      </span>
                    </div>

                    <h3 style={{ margin: "10px 0 4px", fontSize: 19 }}>
                      {v.make} {v.name} ({v.year}) · {v.category} ({v.wheels})
                    </h3>

                    <p className="muted" style={{ margin: "2px 0 8px" }}>
                      Zone: {v.campusZone || v.city} · Rate: {money(v.price)}/day (₹{v.hourlyPrice || 60}/hr) · Deposit: {money(v.deposit || 500)}
                    </p>

                    <p
                      style={{
                        fontSize: 12,
                        background: "#fafbf6",
                        padding: "8px 12px",
                        borderLeft: "3px solid #8ba825",
                        margin: "6px 0",
                      }}
                    >
                      &ldquo;{v.description}&rdquo;
                    </p>

                    <div style={{ fontSize: 11, color: "#546e14", display: "flex", gap: 16 }}>
                      <span>✓ Insurance: {v.insuranceValidTill || "Active"}</span>
                      <span>✓ Helmet Policy: {v.helmetOption || "Provided"}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", minWidth: 160 }}>
                    <div className="price">{money(v.price)} <small>/ day</small></div>
                    <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
                      <Link
                        href={`/rent/vehicle/${v.id}`}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "6px 12px",
                          background: "#ffffff",
                          border: "1px solid var(--line)",
                          textAlign: "center",
                        }}
                      >
                        View Vehicle Profile
                      </Link>

                      {v.status === "approved" ? (
                        <button
                          type="button"
                          onClick={() => handleModerateVehicle(v.id, "rejected", "Regulatory suspension by admin")}
                          style={{
                            background: "#fff5f5",
                            color: "#c53030",
                            border: "1px solid #fed7d7",
                            padding: "6px 12px",
                            fontSize: 11,
                            cursor: "pointer",
                          }}
                        >
                          Suspend Listing
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleModerateVehicle(v.id, "approved")}
                          style={{
                            background: "#f0f5e3",
                            color: "#415415",
                            border: "1px solid #c9d8a5",
                            padding: "6px 12px",
                            fontSize: 11,
                            cursor: "pointer",
                            fontWeight: 700,
                          }}
                        >
                          Approve Listing
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* TAB 2: KYC & USER VERIFICATION */}
          {activeTab === "kyc" && (
            <div style={{ display: "grid", gap: 12 }}>
              {data?.users.map((u: any) => (
                <div
                  key={u.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--line)",
                    padding: 20,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span
                        className="pill"
                        style={{
                          background: u.kycStatus === "verified" ? "#e6f4c5" : "#fee2e2",
                          color: u.kycStatus === "verified" ? "#31450f" : "#991b1b",
                        }}
                      >
                        {u.kycStatus.toUpperCase()}
                      </span>
                      <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "#74786d" }}>
                        Role: <strong>{u.role.toUpperCase()}</strong>
                      </span>
                    </div>

                    <h3 style={{ margin: "8px 0 4px", fontSize: 18 }}>{u.name}</h3>
                    <p className="muted" style={{ margin: 0 }}>
                      Email: {u.email} · Phone: {u.phone}
                    </p>
                    <p className="muted" style={{ margin: "2px 0 0" }}>
                      Affiliation: <strong>{u.campusAffiliation || "Campus Member"}</strong> · Driving License:{" "}
                      <strong>{u.drivingLicense || "Not required / Exempt"}</strong>
                    </p>
                  </div>

                  <div>
                    {u.kycStatus === "verified" ? (
                      <button
                        type="button"
                        onClick={() => handleModerateKyc(u.id, "unverified")}
                        style={{
                          background: "#fff5f5",
                          border: "1px solid #fed7d7",
                          color: "#c53030",
                          padding: "6px 14px",
                          fontSize: 11,
                          cursor: "pointer",
                        }}
                      >
                        Revoke KYC
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleModerateKyc(u.id, "verified")}
                        className="button-primary"
                        style={{ fontSize: 11, padding: "6px 14px" }}
                      >
                        Verify Credentials
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: BOOKINGS & TRANSACTIONS */}
          {activeTab === "bookings" && (
            <div style={{ display: "grid", gap: 12 }}>
              {data?.bookings.map((b: any) => (
                <div
                  key={b.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--line)",
                    padding: 18,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className="pill">{b.status}</span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 11 }}>
                        Ref: <strong>{b.id}</strong>
                      </span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#74786d" }}>
                        Txn: {b.paymentTxnId}
                      </span>
                    </div>
                    <h3 style={{ margin: "8px 0 4px", fontSize: 17 }}>
                      {b.vehicleName} ({b.registrationNumber || "Inspected"})
                    </h3>
                    <p className="muted" style={{ margin: 0 }}>
                      Customer: <strong>{b.customerName || b.guest}</strong> · Partner:{" "}
                      <strong>{b.ownerName}</strong>
                    </p>
                    <p className="muted" style={{ margin: "2px 0 0" }}>
                      Period: {b.start} to {b.end} · Pickup: {b.pickupZone || b.city}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div className="price">{money(b.total)}</div>
                    <div className="muted" style={{ fontSize: 11 }}>
                      Platform Commission: {money(b.platformFee || Math.round(b.total * 0.1))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: DISBURSAL SETTLEMENTS */}
          {activeTab === "payouts" && (
            <div style={{ display: "grid", gap: 12 }}>
              {data?.payouts.map((p: any) => (
                <div
                  key={p.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--line)",
                    padding: 18,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className="pill" style={{ background: "#e8f2cb", color: "#3a4f10" }}>
                        {p.status}
                      </span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 11 }}>
                        Disbursal ID: <strong>{p.id}</strong>
                      </span>
                    </div>
                    <h3 style={{ margin: "8px 0 2px", fontSize: 17 }}>
                      Partner: {p.ownerName}
                    </h3>
                    <p className="muted" style={{ margin: 0 }}>
                      Destination: {p.destinationAccount} · UTR: {p.utrNumber}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: "#34470d" }}>
                      {money(p.netSettlement)}
                    </div>
                    <div className="muted" style={{ fontSize: 10 }}>
                      Gross: {money(p.amount)} (Fee: {money(p.platformCommission)})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
