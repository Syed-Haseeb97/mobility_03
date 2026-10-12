import Link from "next/link";
import {
  ArrowUpRight,
  CalendarCheck,
  ChartNoAxesCombined,
  KeyRound,
  ShieldCheck,
  FileCheck,
  Banknote,
  Users,
} from "lucide-react";

export default function HostIntro() {
  return (
    <main>
      <section className="hero" style={{ minHeight: 460, paddingTop: 85, paddingBottom: 80 }}>
        <div className="hero-grid">
          <div>
            <div className="eyebrow">Vehicle Partner Network</div>
            <h1>
              Your vehicle.
              <br />
              Your <em>terms.</em>
            </h1>
            <p className="hero-copy">
              Connect your two-wheeler or passenger car with verified campus students and institutional
              members. Set your daily and hourly rates, manage your handover calendar, and receive prompt
              settlement disbursements.
            </p>
            <div className="hero-actions">
              <Link className="button-primary" href="/host/add-vehicle">
                List Your Vehicle <ArrowUpRight size={16} />
              </Link>
              <Link className="text-link" href="/host/dashboard" style={{ color: "#c8ff3a" }}>
                Partner Dashboard <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div
              style={{
                border: "1px solid rgba(255, 255, 255, 0.17)",
                padding: 35,
                width: "100%",
                maxWidth: 420,
                background: "rgba(255, 255, 255, 0.04)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="eyebrow" style={{ color: "var(--lime)" }}>
                HOST STUDIO
              </div>
              <h2 style={{ fontSize: 30, letterSpacing: "-1.2px", lineHeight: 1.15, marginTop: 8 }}>
                Built around your operational workflow.
              </h2>
              {[
                "Authoritative Pricing & Deposit Rules",
                "Digital Key Handover & Return Logging",
                "Automated UPI / IMPS Disbursal Settlements",
              ].map((x, i) => (
                <p
                  key={x}
                  style={{
                    borderTop: "1px solid rgba(255, 255, 255, 0.14)",
                    paddingTop: 14,
                    color: "#c8cec0",
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    fontSize: 13,
                  }}
                >
                  {i === 0 ? (
                    <KeyRound size={16} className="text-[#c8ff3a]" />
                  ) : i === 1 ? (
                    <CalendarCheck size={16} className="text-[#c8ff3a]" />
                  ) : (
                    <Banknote size={16} className="text-[#c8ff3a]" />
                  )}
                  {x}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Enterprise Hosting Architecture</div>
            <h2>
              Good partnerships
              <br />
              start with verified standards.
            </h2>
          </div>
          <ShieldCheck size={42} strokeWidth={1.5} className="text-[#68811e]" />
        </div>

        <div className="vehicle-grid">
          {[
            {
              n: "01",
              title: "Create Your Listing",
              body: "Provide accurate specifications, upload your registration certificate (RC), declare helmet provisions, and specify your designated campus pickup zone.",
            },
            {
              n: "02",
              title: "Digital Key Handover",
              body: "Inspect the customer's driving license, log the starting odometer reading and fuel level, issue the sanitized ISI helmet, and activate the reservation.",
            },
            {
              n: "03",
              title: "Settlement & Payouts",
              body: "Review completed trips in your financial ledger and withdraw your net rental revenue directly via instant IMPS or UPI settlement.",
            },
          ].map((x) => (
            <div key={x.n} style={{ borderTop: "1px solid var(--line)", paddingTop: 22 }}>
              <div className="eyebrow">{x.n} / OPERATIONAL WORKFLOW</div>
              <h3 style={{ fontSize: 22, marginTop: 18 }}>{x.title}</h3>
              <p className="muted">{x.body}</p>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 40,
            padding: "18px 22px",
            background: "#ffffff",
            border: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Standard Campus Platform Terms</div>
            <p className="muted" style={{ margin: "4px 0 0" }}>
              Mobility operates with a transparent 10% platform commission on completed trips, covering
              roadside assistance dispatch, 24/7 security monitoring, and regulatory compliance checks.
            </p>
          </div>
          <Link className="button-primary" href="/host/add-vehicle">
            Get Started <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  );
}
