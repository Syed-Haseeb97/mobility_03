import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Bike, CarFront, Clock3, MapPin, ShieldCheck, Zap } from "lucide-react";
import { seedVehicles, type Vehicle } from "@/lib/data";
import { db } from "@/lib/server/db";
import { VehicleCard } from "@/components/vehicle-card";
import { HomeSearch } from "@/components/home-search";

export const dynamic = "force-dynamic";

function pickFeaturedVehicles(candidates: Vehicle[]): Vehicle[] {
  const selected: Vehicle[] = [];
  const add = (vehicle?: Vehicle) => {
    if (vehicle && !selected.some((item) => item.id === vehicle.id)) selected.push(vehicle);
  };

  // Show the breadth of the marketplace instead of repeating three bikes by seed order.
  add(candidates.find((vehicle) => vehicle.fuel.toLowerCase() === "electric" || vehicle.category === "Electric"));
  add(candidates.find((vehicle) => vehicle.wheels === "2-Wheeler" && vehicle.category === "Bike"));
  add(candidates.find((vehicle) => vehicle.wheels === "4-Wheeler"));
  for (const vehicle of candidates) {
    if (selected.length >= 3) break;
    add(vehicle);
  }
  return selected.slice(0, 3);
}

function getFeaturedVehicles(): Vehicle[] {
  try {
    const liveVehicles = db.getVehicles({ status: "approved" }).map((vehicle) => ({
      ...vehicle,
      host: vehicle.ownerName,
    }));
    return pickFeaturedVehicles(liveVehicles);
  } catch {
    // Keep the homepage useful if the local demo store has not been initialized.
    return pickFeaturedVehicles(seedVehicles.filter((vehicle) => vehicle.status === "approved"));
  }
}

const steps = [
  { number: "01", title: "Find your fit", body: "Browse bikes, scooters, EVs, and cars by location and daily rate." },
  { number: "02", title: "Check the details", body: "Compare pickup information, rental terms, and the documents shown on each listing." },
  { number: "03", title: "Plan the trip", body: "Choose your dates and review the booking details before confirming." },
];

export default function Home() {
  const featuredVehicles = getFeaturedVehicles();
  const publicPreview =
    process.env.NODE_ENV === "production" &&
    process.env.MOBILITY_ENABLE_UNSAFE_DEMO_MODE !== "true";

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-grid">
          <div className="home-hero-copy">
            <div className="home-eyebrow"><span className="home-eyebrow-dot" /> CAMPUS-FIRST MOBILITY</div>
            <h1>Your campus.<br />Your <em>next move.</em></h1>
            <p className="home-hero-description">
              From the first class to the last-minute errand, find a ride that fits your day.
              Compare bikes, scooters, EVs, and cars in one simple place.
            </p>
            <div className="home-hero-actions">
              <Link className="home-primary-cta" href="/rent">Explore rides <ArrowUpRight size={18} /></Link>
              <Link className="home-secondary-cta" href="/list-your-vehicle">Have a vehicle? <span>List it <ArrowUpRight size={15} /></span></Link>
            </div>
            <div className="home-hero-footnote">
              <span><MapPin size={14} /> Campus zones &amp; nearby areas</span>
              <span><Clock3 size={14} /> Hourly and daily options on eligible listings</span>
            </div>
          </div>

          <div className="home-hero-art" role="img" aria-label="Illustrative route from a campus gate to a city destination">
            <div className="home-art-orbit home-art-orbit-one" />
            <div className="home-art-orbit home-art-orbit-two" />
            <div className="home-art-grid" />
            <div className="home-route-map" aria-hidden="true">
              <svg className="home-route-lines" viewBox="0 0 600 480" fill="none">
                <path className="home-route-secondary" d="M40 120 C135 95 155 155 235 125 S365 70 430 145 S515 230 580 205" />
                <path className="home-route-track" d="M72 330 C140 280 150 185 240 205 S355 295 410 210 S490 140 530 110" />
                <circle className="home-route-dot" cx="72" cy="330" r="7" />
                <circle className="home-route-dot home-route-dot-end" cx="530" cy="110" r="7" />
              </svg>
              <div className="home-map-node home-map-node-campus">
                <span className="home-map-pin"><MapPin size={15} /></span>
                <div><small>01 / START</small><strong>Campus gate</strong></div>
              </div>
              <div className="home-map-node home-map-node-library">
                <span className="home-map-pin home-map-pin-light"><MapPin size={15} /></span>
                <div><small>02 / ON THE WAY</small><strong>Your next stop</strong></div>
              </div>
              <div className="home-map-node home-map-node-destination">
                <span className="home-map-pin"><MapPin size={15} /></span>
                <div><small>03 / ARRIVE</small><strong>City, your way</strong></div>
              </div>
              <div className="home-map-floating home-map-floating-bike"><Bike size={17} /><span>BIKES &amp; SCOOTERS</span></div>
              <div className="home-map-floating home-map-floating-car"><CarFront size={17} /><span>CARS &amp; EVS</span></div>
              <div className="home-art-caption">
                <span className="home-art-caption-icon"><Zap size={16} /></span>
                <div><strong>One search. More ways to go.</strong><span>Compare options for your day.</span></div>
                <ArrowDownRight size={19} />
              </div>
            </div>
            <div className="home-art-side-note">CAMPUS TO CITY · YOUR CHOICE</div>
          </div>
        </div>
        <div className="home-hero-bottomline"><span>LESS PLANNING. MORE GETTING THERE.</span><span>BUILT AROUND YOUR DAY <ArrowDownRight size={14} /></span></div>
      </section>

      <HomeSearch />

      <section className="home-category-section">
        <div className="home-section-intro">
          <div><span className="home-section-kicker">PICK YOUR PACE</span><h2>One campus.<br /><em>More ways to move.</em></h2></div>
          <p>Quick solo rides, low-key electric commutes, or room for the whole crew. Start with the kind of ride you need.</p>
        </div>
        <div className="home-category-grid">
          <Link className="home-category-card home-category-bike" href="/rent?wheels=2-Wheeler">
            <div className="home-category-top"><span>01 / TWO WHEELS</span><Bike size={19} /></div>
            <div><h3>Bikes &amp; scooters</h3><p>For classes, errands, and getting across town.</p><span className="home-category-link">Browse two-wheelers <ArrowUpRight size={16} /></span></div>
            <span className="home-category-watermark">02</span>
          </Link>
          <Link className="home-category-card home-category-car" href="/rent?wheels=4-Wheeler">
            <div className="home-category-top"><span>02 / FOUR WHEELS</span><CarFront size={20} /></div>
            <div><h3>Cars for the day</h3><p>More room for group projects, groceries, and weekends.</p><span className="home-category-link">Browse cars <ArrowUpRight size={16} /></span></div>
            <span className="home-category-watermark">04</span>
          </Link>
          <Link className="home-category-card home-category-ev" href="/rent?search=Electric">
            <div className="home-category-top"><span>03 / ELECTRIC</span><Zap size={19} /></div>
            <div><h3>Electric rides</h3><p>A quieter option for the everyday campus loop.</p><span className="home-category-link">Explore EVs <ArrowUpRight size={16} /></span></div>
            <span className="home-category-watermark">EV</span>
          </Link>
        </div>
      </section>

      <section className="home-featured-section">
        <div className="home-section-intro home-featured-intro">
          <div><span className="home-section-kicker">START EXPLORING</span><h2>Rides worth<br /><em>a closer look.</em></h2></div>
          <div className="home-featured-side"><p>Explore current approved listings and compare the details before choosing your ride.</p><Link href="/rent" className="home-inline-link">View all rides <ArrowUpRight size={16} /></Link></div>
        </div>
        {publicPreview && (
          <div className="home-preview-note" role="status">
            <span>PREVIEW INVENTORY</span>
            <p>Illustrative listings are shown for the showcase. Booking requests and payments are disabled on this deployment.</p>
          </div>
        )}
        {featuredVehicles.length ? (
          <div className="vehicle-grid home-featured-grid">
            {featuredVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
          </div>
        ) : (
          <div className="home-inventory-empty"><span>NO LISTINGS JUST YET</span><h3>Your next ride is on the way.</h3><p>Check back soon, or browse the marketplace for updates.</p><Link href="/rent" className="home-inline-link">Open marketplace <ArrowUpRight size={16} /></Link></div>
        )}
      </section>

      <section className="home-how-section">
        <div className="home-how-heading"><span className="home-section-kicker">MADE TO FEEL SIMPLE</span><h2>From “where to?”<br /><em>to “let’s go.”</em></h2><p>Everything starts with a clear choice. No automotive jargon required.</p></div>
        <div className="home-steps">
          {steps.map((step) => <article className="home-step" key={step.number}><span className="home-step-number">{step.number}</span><div><h3>{step.title}</h3><p>{step.body}</p></div><ArrowUpRight className="home-step-arrow" size={19} /></article>)}
        </div>
      </section>

      <section className="home-host-band">
        <div className="home-host-graphic" aria-hidden="true"><div className="home-host-circle"><Bike size={58} strokeWidth={1.1} /></div><span className="home-host-spark">✳</span><span className="home-host-cross">+</span></div>
        <div className="home-host-copy"><span className="home-section-kicker">FOR OWNERS &amp; LOCAL PARTNERS</span><h2>Your vehicle could<br /><em>go further.</em></h2><p>Bring your vehicle to the Mobility marketplace. Create a listing, share pickup details, and manage requests from one place.</p><Link className="home-primary-cta" href="/list-your-vehicle">Become a partner <ArrowUpRight size={18} /></Link></div>
      </section>

      <section className="home-trust-strip">
        <div className="home-trust-icon"><ShieldCheck size={21} /></div>
        <div><strong>Know what you’re booking.</strong><p>Review each listing’s details, pickup notes, and verification information. If something is missing, ask before you ride.</p></div>
        <Link href="/guidelines">Read our safety guidelines <ArrowUpRight size={16} /></Link>
      </section>
    </main>
  );
}
