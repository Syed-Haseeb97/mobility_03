import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  FileCheck2,
  HardHat,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";

export default function GuidelinesPage() {
  return (
    <main className="page-shell">
      {/* HEADER */}
      <div className="page-top">
        <div>
          <div className="eyebrow">Trust &amp; Regulatory Standard / Campus Safety</div>
          <h1 className="page-heading">
            Good rides begin with
            <br />
            clear ground rules.
          </h1>
          <p className="page-intro" style={{ marginTop: 14 }}>
            Mobility connects students and campus personnel with verified two-wheelers and passenger
            vehicles. Operational clarity, roadworthiness, and helmet compliance protect everyone on the road.
          </p>
        </div>

        <Link className="button-primary" href="/rent">
          Find a Ride <ArrowUpRight size={15} />
        </Link>
      </div>

      {/* SECTION 1: FOR STUDENTS */}
      <section style={{ marginTop: 40, borderTop: "2px solid #171915", paddingTop: 35 }}>
        <div className="section-head" style={{ marginBottom: 25 }}>
          <div>
            <div className="eyebrow">For Students &amp; Renters</div>
            <h2 style={{ fontSize: 28 }}>Before you take the keys.</h2>
            <p className="section-sub">
              Take two minutes at collection to inspect the vehicle, verify documentation, and lock in
              the exact terms of return.
            </p>
          </div>
        </div>

        <div className="vehicle-grid">
          {[
            {
              n: "01",
              title: "Agree on the complete price upfront",
              body: "Confirm hourly vs. daily calculation, what constitutes a return grace period, security deposit handling, and roadside assistance inclusions before key exchange.",
            },
            {
              n: "02",
              title: "Complete physical pre-ride inspection",
              body: "Inspect headlamps, indicators, brake lever response, tire tread depth, and existing chassis scuffs. Ensure the registration plate matches your digital booking voucher.",
            },
            {
              n: "03",
              title: "Wear a certified, properly fitted helmet",
              body: "Two-wheeler rentals include an ISI/DOT certified helmet. Confirm chin-strap locking and visor transparency. Helmet wearing is compulsory for both operator and pillion.",
            },
            {
              n: "04",
              title: "Explicit return handover plan",
              body: "Coordinate exact return time and drop-off bay. Ensure fuel level matches collection level or settle fuel difference according to stated provider rates.",
            },
          ].map((item) => (
            <div
              key={item.n}
              style={{
                background: "#ffffff",
                border: "1px solid var(--line)",
                padding: 24,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "#748831",
                  letterSpacing: "1px",
                }}
              >
                {item.n} / PRE-DEPARTURE CHECK
              </div>
              <h3 style={{ fontSize: 18, margin: "14px 0 8px" }}>{item.title}</h3>
              <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 20,
            background: "#eff4dc",
            border: "1px solid #d5e4af",
            padding: "16px 20px",
            fontSize: 12,
            color: "#384714",
            lineHeight: 1.7,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <MapPin size={20} className="text-[#556b19] flex-shrink-0" />
          <div>
            <strong>Campus Safety Advisory:</strong> Always conduct collection and return at designated
            public campus bays (e.g. North Gate Kiosks, Library Plaza Docks, or Admin Ring Slots). Never agree to remote or unverified meeting points.
          </div>
        </div>
      </section>

      {/* SECTION 2: FOR RENTAL PROVIDERS */}
      <section style={{ marginTop: 60, borderTop: "2px solid #171915", paddingTop: 35 }}>
        <div className="section-head" style={{ marginBottom: 25 }}>
          <div>
            <div className="eyebrow">For Vehicle Owners &amp; Fleet Partners</div>
            <h2 style={{ fontSize: 28 }}>Make a listing worth trusting.</h2>
            <p className="section-sub">
              Quality listings build a reliable campus mobility marketplace. Transparency prevents
              disputes and, once a real payment provider is connected, payment and settlement reconciliation.
            </p>
          </div>
          <Link className="text-link" href="/host/add-vehicle">
            Onboard a vehicle <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="vehicle-grid">
          {[
            {
              n: "01",
              title: "Partner identity review",
              body: "Provide verified business name or personal identification, contact phone, and designated physical kiosk address for seamless student collections.",
            },
            {
              n: "02",
              title: "Complete Decision Details",
              body: "State exact model year, fuel or EV powertrain, hourly flex rate, daily rate, helmet inclusions, and refundable deposit requirements clearly.",
            },
            {
              n: "03",
              title: "Active Legal & Mechanical Hygiene",
              body: "Ensure registration certificate (RC), commercial insurance, and pollution certificates (PUCC) remain active. Clean and sanitize helmets between rentals.",
            },
          ].map((item) => (
            <div
              key={item.n}
              style={{
                background: "#ffffff",
                border: "1px solid var(--line)",
                padding: 24,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "#748831",
                  letterSpacing: "1px",
                }}
              >
                {item.n} / PARTNER STANDARDS
              </div>
              <h3 style={{ fontSize: 18, margin: "14px 0 8px" }}>{item.title}</h3>
              <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: VERIFICATION PHILOSOPHY */}
      <section
        id="verification"
        style={{
          marginTop: 60,
          background: "#171a15",
          color: "#f5f6ed",
          padding: "45px 36px",
          borderRadius: 2,
        }}
      >
        <div className="eyebrow" style={{ color: "#c8ff3a" }}>
          Platform Governance
        </div>
        <h2 style={{ fontSize: 32, letterSpacing: "-1px", margin: "12px 0 16px" }}>
          A badge should follow evidence — not a promise.
        </h2>
        <p style={{ maxWidth: 650, color: "#cbd0c2", lineHeight: 1.8, fontSize: 14 }}>
          A listing is not independently verified just because it appears in the directory.
          Before a public launch, each verification badge must be backed by an auditable review of
          current registration, insurance, and provider documents.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
            marginTop: 35,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              padding: 20,
            }}
          >
            <FileCheck2 size={24} className="text-[#c8ff3a]" style={{ marginBottom: 10 }} />
            <div style={{ fontWeight: 700, fontSize: 14 }}>RC Plate Verification</div>
            <p style={{ color: "#a5aba0", fontSize: 12, lineHeight: 1.7, margin: "6px 0 0" }}>
              Before marking a listing verified, an authorized reviewer must compare the registration details against official transport records.
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              padding: 20,
            }}
          >
            <ShieldCheck size={24} className="text-[#c8ff3a]" style={{ marginBottom: 10 }} />
            <div style={{ fontWeight: 700, fontSize: 14 }}>Active Commercial Insurance</div>
            <p style={{ color: "#a5aba0", fontSize: 12, lineHeight: 1.7, margin: "6px 0 0" }}>
              Confirm that the actual policy covers the intended rental use, third-party liability, and any roadside assistance represented by the host.
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              padding: 20,
            }}
          >
            <HardHat size={24} className="text-[#c8ff3a]" style={{ marginBottom: 10 }} />
            <div style={{ fontWeight: 700, fontSize: 14 }}>Certified Helmet Compliance</div>
            <p style={{ color: "#a5aba0", fontSize: 12, lineHeight: 1.7, margin: "6px 0 0" }}>
              ISI certified helmets inspected for clean liner condition and unbroken chin strap buckles.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
