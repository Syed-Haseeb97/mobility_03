"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck2,
  Fuel,
  Gauge,
  HardHat,
  Info,
  MapPin,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { money, daysBetween, type Vehicle } from "@/lib/data";
import { useSession } from "@/components/session-provider";

export default function VehicleDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { currentUser } = useSession();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking form state
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [guestName, setGuestName] = useState(currentUser?.name || "Ananya Raman");
  const [email, setEmail] = useState(currentUser?.email || "ananya.r@iiitt.ac.in");
  const [phone, setPhone] = useState(currentUser?.phone || "+91 98401 23456");
  const [drivingLicense, setDrivingLicense] = useState(
    currentUser?.drivingLicense || "TN-09-2023-0045192"
  );
  const [helmetOption, setHelmetOption] = useState("1 Helmet Included (Free)");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CARD" | "NETBANKING">("UPI");
  const [today, setToday] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [bookingNotice, setBookingNotice] = useState<{
    type: "error" | "success";
    message: string;
    bookingId?: string;
  } | null>(null);

  useEffect(() => {
    const now = new Date();
    setToday(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`);
  }, []);

  // Synchronize with currentUser when loaded
  useEffect(() => {
    if (currentUser) {
      if (!guestName || guestName === "Ananya Raman") setGuestName(currentUser.name);
      if (!email || email === "ananya.r@iiitt.ac.in") setEmail(currentUser.email);
      if (currentUser.phone) setPhone(currentUser.phone);
      if (currentUser.drivingLicense) setDrivingLicense(currentUser.drivingLicense);
    }
  }, [currentUser]);

  // Fetch vehicle details from API
  useEffect(() => {
    async function loadVehicle() {
      try {
        const res = await fetch(`/api/vehicles/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.vehicle) {
            setVehicle(data.vehicle);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load vehicle from API:", err);
      } finally {
        setLoading(false);
      }
    }
    loadVehicle();
  }, [params.id]);

  const days = daysBetween(start, end);
  const is2Wheeler =
    vehicle?.wheels === "2-Wheeler" ||
    vehicle?.category === "Bike" ||
    vehicle?.category === "Scooter";

  // Authoritative price calculations
  const priceCalculations = useMemo(() => {
    if (!vehicle || days <= 0 || !start || !end) {
      return {
        base: 0,
        damageWaiver: 0,
        platformFee: 0,
        taxes: 0,
        deposit: 0,
        total: 0,
      };
    }
    const base = vehicle.price * days;
    const damageWaiver = is2Wheeler ? 50 * days : 150 * days;
    const platformFee = Math.round(base * 0.1);
    const taxes = Math.round((base + platformFee) * 0.05);
    const deposit = vehicle.deposit || (is2Wheeler ? 500 : 2000);
    const total = base + damageWaiver + platformFee + taxes;

    return {
      base,
      damageWaiver,
      platformFee,
      taxes,
      deposit,
      total,
    };
  }, [vehicle, days, start, end, is2Wheeler]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicle) return;

    if (!start || !end || days <= 0) {
      setBookingNotice({
        type: "error",
        message: "Please specify valid pick-up and return dates.",
      });
      return;
    }

    if (!guestName.trim() || !email.includes("@")) {
      setBookingNotice({
        type: "error",
        message: "Please provide a valid full name and email address.",
      });
      return;
    }

    if (!drivingLicense || drivingLicense.trim().length < 6) {
      setBookingNotice({
        type: "error",
        message:
          "A valid driving license number is mandatory for vehicle booking and key handover.",
      });
      return;
    }

    if (!agreedToTerms) {
      setBookingNotice({
        type: "error",
        message:
          "Please accept the campus rental agreement and safety guidelines to proceed.",
      });
      return;
    }

    setSubmitting(true);
    setBookingNotice(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          customerId: currentUser?.id || "usr-cust-1",
          customerName: guestName.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          drivingLicense: drivingLicense.trim().toUpperCase(),
          start,
          end,
          helmetOptionSelected: helmetOption,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setBookingNotice({
          type: "error",
          message: data.error || "Unable to confirm booking. Please try again.",
        });
        setSubmitting(false);
        return;
      }

      setBookingNotice({
        type: "success",
        message: `Request saved: ${data.booking.id}. Payment is still pending; no money has been collected in this demo.`,
        bookingId: data.booking.id,
      });

      // Clear dates
      setStart("");
      setEnd("");
    } catch (err) {
      setBookingNotice({
        type: "error",
        message: "A network error occurred while booking. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="page-shell">
        <p className="page-intro">Loading vehicle specification sheet…</p>
      </main>
    );
  }

  if (!vehicle) {
    return (
      <main className="page-shell">
        <h1 className="page-heading">Vehicle listing not found.</h1>
        <p className="muted" style={{ margin: "14px 0 24px" }}>
          This vehicle may have been delisted or relocated by its partner.
        </p>
        <Link className="text-link" href="/rent">
          <ArrowLeft size={15} /> Return to marketplace
        </Link>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <Link className="text-link" href="/rent">
        <ArrowLeft size={15} /> Back to all rides
      </Link>

      {/* TOP HEADER */}
      <div className="page-top" style={{ marginTop: 24 }}>
        <div>
          <div className="eyebrow">
            {vehicle.city} · {vehicle.campusZone || "Campus Edge"} · {vehicle.wheels}
          </div>
          <h1 className="page-heading">
            {vehicle.make}
            <br />
            {vehicle.name}
          </h1>
          <p className="page-intro" style={{ marginTop: 8 }}>
            ★ {vehicle.rating.toFixed(2)} · {vehicle.trips} trips · Hosted by{" "}
            <strong>{vehicle.host}</strong>
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <div className="price">
            {money(vehicle.price)} <small>/ day</small>
          </div>
          {vehicle.hourlyPrice && (
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "#6b7d2f",
                marginTop: 4,
              }}
            >
              Hourly Flex: ₹{vehicle.hourlyPrice} / hr
            </div>
          )}
        </div>
      </div>

      <div className="detail-layout">
        {/* LEFT COLUMN: VEHICLE DETAILS & SPECIFICATIONS */}
        <div>
          <div style={{ position: "relative" }}>
            <Image
              className="detail-image"
              src={vehicle.image}
              alt={vehicle.name}
              width={1200}
              height={750}
              priority
            />
            {vehicle.rcVerified && (
              <div
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  background: "rgba(18, 20, 16, 0.9)",
                  backdropFilter: "blur(8px)",
                  padding: "8px 14px",
                  borderRadius: 3,
                  border: "1px solid rgba(200, 255, 58, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#ffffff",
                  fontSize: 11,
                  fontFamily: "var(--mono)",
                }}
              >
                <ShieldCheck size={14} className="text-[#c8ff3a]" />
                <span>
                  Official Registration Plate: <strong>{vehicle.registrationNumber}</strong>
                </span>
              </div>
            )}
          </div>

          {/* QUICK SPEC TILES */}
          <div className="stat-row" style={{ marginTop: 20 }}>
            <div className="stat">
              <strong>{vehicle.seats}</strong>
              <span>
                <Users size={12} style={{ display: "inline" }} /> Seating Capacity
              </span>
            </div>
            <div className="stat">
              <strong>{vehicle.transmission}</strong>
              <span>
                <Gauge size={12} style={{ display: "inline" }} /> Transmission
              </span>
            </div>
            <div className="stat">
              <strong>{vehicle.fuel}</strong>
              <span>
                <Fuel size={12} style={{ display: "inline" }} /> Powertrain
              </span>
            </div>
          </div>

          {/* OWNER LISTING DESCRIPTION */}
          <div style={{ padding: "30px 0", borderBottom: "1px solid var(--line)" }}>
            <div className="eyebrow">Owner Listing Information</div>
            <h2 style={{ fontSize: 24, letterSpacing: "-0.8px", margin: "10px 0 14px" }}>
              Vehicle Description
            </h2>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.8,
                color: "#3f4237",
                background: "#ffffff",
                padding: 20,
                border: "1px solid var(--line)",
                borderLeft: "4px solid #8ba825",
              }}
            >
              {vehicle.description}
            </p>
          </div>

          {/* PICKUP & LOGISTICAL SPECIFICATIONS */}
          <div style={{ padding: "26px 0", borderBottom: "1px solid var(--line)" }}>
            <div className="eyebrow">Logistics &amp; Handover Location</div>
            <h3 style={{ fontSize: 18, margin: "10px 0 12px" }}>Designated Collection Point</h3>
            <div
              style={{
                display: "grid",
                gap: 12,
                background: "#ffffff",
                padding: 18,
                border: "1px solid var(--line)",
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <MapPin size={16} className="text-[#678220]" style={{ marginTop: 2 }} />
                <div>
                  <strong>{vehicle.campusZone || "Campus Edge Transit Hub"}</strong>
                  <p className="muted" style={{ margin: "2px 0 0" }}>
                    {vehicle.pickupAddress || "Pickup kiosk coordinates provided upon reservation."}
                  </p>
                </div>
              </div>

              {vehicle.hostNotes && (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    borderTop: "1px solid var(--line)",
                    paddingTop: 10,
                  }}
                >
                  <Info size={16} className="text-[#678220]" style={{ marginTop: 2 }} />
                  <div>
                    <strong style={{ fontSize: 12 }}>Host Notes for Renter:</strong>
                    <p className="muted" style={{ margin: "2px 0 0" }}>
                      {vehicle.hostNotes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* HELMET & SAFETY PROTOCOL */}
          {is2Wheeler && (
            <div style={{ padding: "26px 0", borderBottom: "1px solid var(--line)" }}>
              <div className="eyebrow">Campus Safety &amp; Helmet Protocol</div>
              <h3 style={{ fontSize: 18, margin: "10px 0 12px" }}>Helmet Equipment Status</h3>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  background: "#f4f7ea",
                  padding: 16,
                  border: "1px solid #dce4c3",
                }}
              >
                <HardHat size={28} className="text-[#55691d]" />
                <div>
                  <strong style={{ color: "#2d3810" }}>
                    {vehicle.helmetOption || "1 ISI Certified Helmet Included"}
                  </strong>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "#5a6839" }}>
                    {vehicle.helmetCondition ||
                      "Sanitized ISI/DOT certified helmet with functional visor provided at key handover."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REGULATORY VERIFICATION BADGE */}
          <div style={{ padding: "26px 0" }}>
            <div className="eyebrow">Platform Verification</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 12,
              }}
            >
              <div
                style={{
                  padding: 14,
                  background: "#ffffff",
                  border: "1px solid var(--line)",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <FileCheck2 size={18} className="text-[#637d1e]" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>Registration Certificate</div>
                  <div className="muted" style={{ fontSize: 11 }}>
                    RC Plate: {vehicle.registrationNumber}
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: 14,
                  background: "#ffffff",
                  border: "1px solid var(--line)",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                {vehicle.insuranceVerified ? <ShieldCheck size={18} className="text-[#637d1e]" /> : <ShieldAlert size={18} className="text-[#9a6b24]" />}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>Insurance details</div>
                  <div className="muted" style={{ fontSize: 11 }}>
                    {vehicle.insuranceVerified && vehicle.insuranceValidTill
                      ? `Recorded validity: ${vehicle.insuranceValidTill}`
                      : "Verification pending — confirm coverage with the host before booking."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: AUTHORITATIVE BOOKING & PAYMENT PANEL */}
        <aside className="detail-sidebar">
          <div className="eyebrow">Reservation Desk</div>
          <h2>Configure Rental</h2>
          <p className="muted">
            Send a booking request and review the estimated total. Payment is not collected in this demo.
          </p>

          <form onSubmit={handleBook}>
            <div className="form-stack">
              <label>
                Pick-up Date
                <input
                  type="date"
                  required
                  min={today || undefined}
                  value={start}
                  onChange={(e) => {
                    setStart(e.target.value);
                    if (end && e.target.value > end) setEnd("");
                  }}
                />
              </label>

              <label>
                Return Date
                <input
                  type="date"
                  required
                  min={start || new Date().toISOString().slice(0, 10)}
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </label>

              <label>
                Full Name (as on Driving License)
                <input
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Ananya Raman"
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ananya.r@iiitt.ac.in"
                />
              </label>

              <label>
                Contact Phone
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98401 23456"
                />
              </label>

              <label>
                Driving License (DL) Number
                <input
                  required
                  value={drivingLicense}
                  onChange={(e) => setDrivingLicense(e.target.value.toUpperCase())}
                  placeholder="e.g. TN-09-2023-0045192"
                />
              </label>

              {is2Wheeler && (
                <label>
                  Helmet Arrangement
                  <select
                    value={helmetOption}
                    onChange={(e) => setHelmetOption(e.target.value)}
                  >
                    <option>1 Helmet Included (Free)</option>
                    <option>2 Helmets Required (Free for Pillion)</option>
                    <option>I have my own certified ISI helmet</option>
                  </select>
                </label>
              )}

              <label>
                Preferred payment method (demo only)
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                >
                  <option value="UPI">UPI (Google Pay, PhonePe, BHIM)</option>
                  <option value="CARD">Debit / Credit Card (RuPay, Visa, MC)</option>
                  <option value="NETBANKING">Net Banking (SBI, HDFC, ICICI)</option>
                </select>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: "pointer",
                  marginTop: 6,
                }}
              >
                <input
                  type="checkbox"
                  style={{ width: "auto", marginTop: 2 }}
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <span>
                  I agree to the campus speed limits (25 km/h), mandatory helmet use, and
                  handover inspection checklist.
                </span>
              </label>
            </div>

            {/* Estimated price breakdown */}
            {priceCalculations.total > 0 && (
              <div
                style={{
                  borderTop: "1px solid var(--line)",
                  paddingTop: 16,
                  marginBottom: 17,
                  fontSize: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span className="muted">
                    {money(vehicle.price)} × {days} {days === 1 ? "day" : "days"}
                  </span>
                  <span>{money(priceCalculations.base)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span className="muted">Damage Waiver &amp; Roadside Assist</span>
                  <span>{money(priceCalculations.damageWaiver)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span className="muted">Platform Operational Fee (10%)</span>
                  <span>{money(priceCalculations.platformFee)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span className="muted">GST (5%)</span>
                  <span>{money(priceCalculations.taxes)}</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 800,
                    fontSize: 15,
                    borderTop: "1px dashed var(--line)",
                    paddingTop: 10,
                    marginTop: 8,
                  }}
                >
                  <span>Total Payable Amount</span>
                  <span style={{ color: "#2d3516" }}>{money(priceCalculations.total)}</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 6,
                    fontSize: 11,
                    color: "#777c6f",
                  }}
                >
                  <span>Refundable Security Deposit:</span>
                  <span>{money(priceCalculations.deposit)} (due at handover)</span>
                </div>
              </div>
            )}

            <button
              className="button-primary full-width"
              type="submit"
              disabled={submitting}
              style={{ opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? (
                "Saving booking request…"
              ) : (
                <>
                  Request this ride <ArrowUpRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* NOTICE & FEEDBACK */}
          {bookingNotice && (
            <div
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 3,
                fontSize: 12,
                lineHeight: 1.6,
                background:
                  bookingNotice.type === "success" ? "#f2f7e4" : "#fef2f2",
                border:
                  bookingNotice.type === "success"
                    ? "1px solid #c9d8a5"
                    : "1px solid #fecaca",
                color: bookingNotice.type === "success" ? "#2e3b12" : "#991b1b",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                {bookingNotice.type === "success" ? "✓ Request Saved · Payment Pending" : "Notice"}
              </div>
              {bookingNotice.message}

              {bookingNotice.bookingId && (
                <div style={{ marginTop: 12 }}>
                  <Link
                    href="/rent/bookings"
                    className="button-primary"
                    style={{ fontSize: 11, padding: "8px 14px", display: "inline-flex" }}
                  >
                    View in My Trips Dashboard <ArrowUpRight size={13} />
                  </Link>
                </div>
              )}
            </div>
          )}

          <div
            style={{
              marginTop: 18,
              borderTop: "1px solid var(--line)",
              paddingTop: 12,
              fontSize: 11,
              color: "#74786d",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ShieldCheck size={14} className="text-[#647c1f]" />
            <span>Secure 256-bit encrypted checkout with instant reference code.</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
