"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Plus, Trash2, Eye, ShieldCheck, HardHat, RefreshCw } from "lucide-react";
import { money, type Vehicle } from "@/lib/data";
import { useSession } from "@/components/session-provider";

export default function HostListings() {
  const { currentUser } = useSession();
  const [items, setItems] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const ownerId = currentUser?.id || "usr-host-1";
      const res = await fetch(`/api/vehicles?ownerId=${ownerId}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.vehicles || []);
      }
    } catch (err) {
      console.error("Failed to load host vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [currentUser]);

  async function toggleStatus(id: string, currentStatus: string) {
    const nextStatus = currentStatus === "approved" ? "inactive" : "approved";
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchListings();
      }
    } catch {
      alert("Failed to update status");
    }
  }

  async function removeListing(id: string) {
    if (!confirm("Are you sure you want to deactivate this listing?")) return;
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchListings();
      }
    } catch {
      alert("Failed to deactivate listing");
    }
  }

  return (
    <main className="page-shell">
      <div className="page-top">
        <div>
          <div className="eyebrow">Host Studio / Garage Management</div>
          <h1 className="page-heading">Your vehicle fleet.</h1>
          <p className="page-intro">
            Manage your registered two-wheelers and passenger vehicles. Update pricing,
            pause availability, or view live public listings.
          </p>
        </div>

        <Link className="button-primary" href="/host/add-vehicle">
          <Plus size={16} /> Add a Vehicle
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div className="result-count" style={{ marginBottom: 0 }}>
          {items.length} vehicles registered in your garage
        </div>
        <button
          type="button"
          onClick={fetchListings}
          style={{ background: "none", border: 0, fontSize: 11, fontFamily: "var(--mono)", color: "#74786d", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          <RefreshCw size={11} /> Refresh garage
        </button>
      </div>

      {loading ? (
        <p className="page-intro">Loading garage inventory from database…</p>
      ) : items.length ? (
        <div style={{ display: "grid", gap: 14 }}>
          {items.map((v) => (
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
                    {v.status === "approved" ? "Active / Bookable" : "Paused / Inactive"}
                  </span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#74786d" }}>
                    Plate: <strong>{v.registrationNumber || "RC Pending"}</strong>
                  </span>
                  {v.rcVerified && (
                    <span style={{ fontSize: 10, color: "#546e14", fontWeight: 700 }}>
                      ✓ Documents Verified
                    </span>
                  )}
                </div>

                <h3 style={{ marginTop: 10, fontSize: 19 }}>
                  {v.make} {v.name} ({v.year || 2023})
                </h3>

                <p className="muted" style={{ margin: "4px 0" }}>
                  {v.campusZone || v.city} · {v.category} · {v.wheels} · ★ {v.rating?.toFixed(2) || "5.00"} ({v.trips || 0} trips)
                </p>

                <p
                  style={{
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: "#46493e",
                    background: "#f9faf6",
                    padding: "8px 12px",
                    borderLeft: "3px solid #8fa82e",
                    margin: "8px 0",
                  }}
                >
                  &ldquo;{v.description}&rdquo;
                </p>

                {v.helmetOption && (
                  <div style={{ fontSize: 11, color: "#556f18", marginTop: 4 }}>
                    <HardHat size={12} style={{ display: "inline", marginRight: 4 }} />
                    {v.helmetOption}
                  </div>
                )}
              </div>

              <div style={{ textAlign: "right", minWidth: 160 }}>
                <div className="price">{money(v.price)} <small>/ day</small></div>
                {v.hourlyPrice && (
                  <div className="muted" style={{ fontSize: 11 }}>₹{v.hourlyPrice} / hour</div>
                )}

                <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
                  <Link
                    href={`/rent/vehicle/${v.id}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      background: "#ffffff",
                      border: "1px solid var(--line)",
                      padding: "6px 12px",
                    }}
                  >
                    <Eye size={13} /> View Live Listing
                  </Link>

                  <button
                    type="button"
                    onClick={() => toggleStatus(v.id, v.status)}
                    style={{
                      background: "#f0f2eb",
                      border: "1px solid #d3d7c7",
                      padding: "6px 12px",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {v.status === "approved" ? "Pause Listing" : "Activate Listing"}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeListing(v.id)}
                    style={{
                      background: "none",
                      border: 0,
                      color: "#b91c1c",
                      fontSize: 11,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                    }}
                  >
                    <Trash2 size={12} /> Deactivate
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No vehicles in your garage yet.</h3>
          <p className="muted">
            Add your vehicle to start offering rides to verified students and institutional travelers.
          </p>
          <Link className="button-primary" href="/host/add-vehicle" style={{ marginTop: 18 }}>
            List Your First Vehicle <ArrowUpRight size={15} />
          </Link>
        </div>
      )}
    </main>
  );
}
