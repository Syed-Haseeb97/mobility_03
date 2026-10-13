import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import "./landing.css";
import { SiteHeader } from "@/components/site-header";
import { SessionProvider } from "@/components/session-provider";

export const metadata: Metadata = {
  title: "MOBILITY — Your campus, in motion",
  description:
    "Find bikes, scooters and cars for campus and city travel. Compare listings, pickup details and rental terms in one place.",
  applicationName: "MOBILITY",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionProvider>
          <SiteHeader />
          {children}
          <footer className="site-footer">
            <div style={{ maxWidth: 1320, margin: "0 auto", width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 32,
                  paddingBottom: 28,
                  borderBottom: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div style={{ maxWidth: 360 }}>
                  <Link className="wordmark" href="/">
                    M<span>O</span>BILITY<span className="wordmark-dot">.</span>
                  </Link>
                  <p style={{ marginTop: 12, lineHeight: 1.7, color: "#a7ab9e" }}>
                    A simpler way to find local rides. Review vehicle details, pickup information and rental terms before you book.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 36, flexWrap: "wrap" }}>
                  <div>
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 10,
                        letterSpacing: "1.2px",
                        color: "var(--lime)",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: 10,
                      }}
                    >
                      Renter Portal
                    </span>
                    <div style={{ display: "grid", gap: 7, fontSize: 13, color: "#cbd0c5" }}>
                      <Link href="/rent">Explore Vehicles</Link>
                      {true && <Link href="/rent/bookings">My Reservations</Link>}
                      <Link href="/guidelines">Campus Guidelines</Link>
                    </div>
                  </div>

                  <div>
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 10,
                        letterSpacing: "1.2px",
                        color: "var(--lime)",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: 10,
                      }}
                    >
                      Partner Space
                    </span>
                    <div style={{ display: "grid", gap: 7, fontSize: 13, color: "#cbd0c5" }}>
                      <Link href="/list-your-vehicle">
                        {false ? "Partner Preview" : "Become a Partner"}
                      </Link>
                      {true && <Link href="/host/dashboard">Host Dashboard</Link>}
                      {true && <Link href="/host/listings">Garage Management</Link>}
                      {true && <Link href="/host/add-vehicle">List New Vehicle</Link>}
                    </div>
                  </div>

                  <div>
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 10,
                        letterSpacing: "1.2px",
                        color: "var(--lime)",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: 10,
                      }}
                    >
                      Governance
                    </span>
                    <div style={{ display: "grid", gap: 7, fontSize: 13, color: "#cbd0c5" }}>
                      {true && <Link href="/admin">Platform Operations Desk</Link>}
                      <Link href="/guidelines#verification">Verification Standards</Link>
                      <Link href="/guidelines#safety">Safety &amp; Compliance</Link>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 16,
                  paddingTop: 20,
                  fontSize: 11,
                  color: "#8b9084",
                }}
              >
                <span>© 2026 MOBILITY · CAMPUS &amp; CITY TRAVEL</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: 1 }}>
                  CLEAR LISTINGS · INFORMED BOOKINGS
                </span>
              </div>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
