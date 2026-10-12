import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, MoveUpRight, ShieldCheck, HardHat, Car, Bike } from "lucide-react";
import { seedVehicles } from "@/lib/data";
import { VehicleCard } from "@/components/vehicle-card";
import { HeroCarousel } from "@/components/hero-carousel";


export default function Home() {
  return (
    <main>
      {/* 1. Formal Interactive Vehicle Fleet Inspector */}


      {/* 2. Full-viewport Showcase Carousel */}
      <HeroCarousel />

      {/* 3. Search & Booking Panel */}
      <div className="search-wrap">
        <form className="search-panel" action="/rent">
          <div className="search-field">
            <label htmlFor="city">
              <MapPin size={12} style={{ display: "inline", marginRight: 5 }} />
              Location / Campus Zone
            </label>
            <select id="city" name="city" defaultValue="">
              <option value="">All Locations</option>
              <option>Chennai</option>
              <option>Bengaluru</option>
              <option>Hyderabad</option>
              <option>Mumbai</option>
              <option>Kochi</option>
              <option>Coimbatore</option>
            </select>
          </div>

          <div className="search-field">
            <label htmlFor="wheels">
              <Bike size={12} style={{ display: "inline", marginRight: 5 }} />
              Vehicle Type
            </label>
            <select id="wheels" name="wheels" defaultValue="All vehicles">
              <option>All vehicles</option>
              <option>2-Wheeler</option>
              <option>4-Wheeler</option>
            </select>
          </div>

          <div className="search-field">
            <label htmlFor="start">
              <CalendarDays size={12} style={{ display: "inline", marginRight: 5 }} />
              Pick-up Date
            </label>
            <input
              id="start"
              name="start"
              type="date"
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>

          <div className="search-field">
            <label htmlFor="end">Return Date</label>
            <input
              id="end"
              name="end"
              type="date"
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>

          <button className="search-button" type="submit">
            Find Vehicle <ArrowUpRight size={16} />
          </button>
        </form>
      </div>

      {/* 4. The Considered Collection */}
      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Production Fleet / Verified Directory</div>
            <h2>Curated Campus &amp; Urban Mobility</h2>
            <p className="section-sub">
              Verified two-wheelers and passenger vehicles provided by registered rental partners
              and authorized operators. Rigorous maintenance checks, helmet compliance, and transparent terms.
            </p>
          </div>
          <Link className="text-link" href="/rent">
            Explore all vehicles <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="vehicle-grid">
          {seedVehicles.slice(0, 6).map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>

        <div className="stat-row">
          <div className="stat">
            <strong>100%</strong>
            <span>Verified RC &amp; Insurance</span>
          </div>
          <div className="stat">
            <strong>ISI Helmets</strong>
            <span>Included With Every Two-Wheeler</span>
          </div>
          <div className="stat">
            <strong>Zero Hidden Fees</strong>
            <span>Authoritative Pricing Breakdown</span>
          </div>
        </div>
      </section>

      {/* 5. Partner / Host Band */}
      <section className="dark-band">
        <div>
          <div className="eyebrow">Vehicle Partner Network</div>
          <h2>List your fleet or personal vehicle with verified accountability.</h2>
          <p>
            Connect with verified students and institutional travelers. Configure custom daily &amp; hourly rates,
            set your own pickup zones, track live handovers, and manage settlement earnings from a centralized studio.
          </p>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link className="button-primary" href="/host/add-vehicle">
            List a Vehicle <MoveUpRight size={16} />
          </Link>
          <Link
            className="text-link"
            href="/host/dashboard"
            style={{ color: "#28372b", fontWeight: 700 }}
          >
            Access Host Dashboard <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      {/* 6. How It Works */}
      <section className="section" style={{ paddingTop: 70, paddingBottom: 70 }}>
        <div className="section-head">
          <div>
            <div className="eyebrow">Marketplace Lifecycle</div>
            <h2>
              Structured for trust.
              <br />
              Engineered for safety.
            </h2>
          </div>
          <Link className="text-link" href="/guidelines">
            Read complete rental guidelines <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="vehicle-grid">
          {[
            {
              n: "01",
              title: "Discover & Compare",
              body: "Filter by campus zone, rate period (hourly/daily), helmet option, and powertrain. All listings show authenticated documentation status.",
            },
            {
              n: "02",
              title: "Authoritative Booking",
              body: "Select your dates with server-side concurrency protection, input your driving license, review the itemized price breakdown, and secure payment.",
            },
            {
              n: "03",
              title: "Verified Handover & Trip",
              body: "Meet your partner at the designated campus kiosk. Complete the digital key checklist (odometer, fuel, certified helmet), ride thoughtfully, and return seamlessly.",
            },
          ].map((x) => (
            <div
              key={x.n}
              style={{ borderTop: "1px solid #d9dbcf", paddingTop: 20 }}
            >
              <div className="eyebrow">{x.n} / OPERATIONAL FLOW</div>
              <h3 style={{ fontSize: 22, letterSpacing: "-0.8px", margin: "18px 0 8px" }}>
                {x.title}
              </h3>
              <p className="muted">{x.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
