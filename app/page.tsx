import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Bike, CarFront, Clock3, MapPin, ShieldCheck, Zap } from "lucide-react";
import { seedVehicles, type Vehicle } from "@/lib/data";
import { db } from "@/lib/server/db";
import { VehicleCard } from "@/components/vehicle-card";
import { HomeSearch } from "@/components/home-search";

function getFeaturedVehicles(): Vehicle[] {
  try {
    const liveVehicles = db.getVehicles({ status: "approved" });
    if (liveVehicles.length) {
      return liveVehicles.slice(0, 3).map((vehicle) => ({
        ...vehicle,
        host: vehicle.ownerName,
      }));
    }
  } catch {
    // Keep the homepage useful if the local demo store has not been initialized.
  }
  return seedVehicles.filter((vehicle) => vehicle.status === "approved").slice(0, 3);
}

const steps = [
  { number: "01", title: "Find your fit", body: "Browse bikes, scooters, EVs, and cars by location and daily rate." },
  { number: "02", title: "Check the details", body: "Compare pickup information, rental terms, and the documents shown on each listing." },
  { number: "03", title: "Plan the trip", body: "Choose your dates and review the booking details before confirming." },
];

export default function Home() {
  const featuredVehicles = getFeaturedVehicles();

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

          <div className="home-hero-art" aria-label="A scooter representing everyday campus travel">
            <div className="home-art-orbit home-art-orbit-one" />
            <div className="home-art-orbit home-art-orbit-two" />
            <div className="home-art-grid" />
            <div className="home-art-label home-art-label-top"><span>MOVE LIGHT</span><span>01 / EVERYDAY</span></div>
            <div className="home-art-image">
              <Image src="/vehicles/ather-450x.png" alt="Electric scooter available in the vehicle collection" fill priority sizes="(max-width: 760px) 90vw, 48vw" />
            </div>
            <div className="home-art-caption">
              <span className="home-art-caption-icon"><Zap size={16} /></span>
              <div><strong>Short trip. Big freedom.</strong><span>Find an option that fits your route.</span></div>
              <ArrowDownRight size={19} />
            </div>
            <div className="home-art-side-note">A BETTER WAY TO GET AROUND</div>
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
          <Link className="home-category-card home-category-ev" href="/rent?category=Electric">
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
