import Link from "next/link";
import Image from "next/image";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bike,
  CarFront,
  Check,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { VehicleCard } from "@/components/vehicle-card";
import { HomeSearch } from "@/components/home-search";
import { db } from "@/lib/server/db";
import type { Vehicle } from "@/lib/data";

export const revalidate = 0;

export default function Home() {
  const featuredVehicles = db
    .getVehicles({ status: "approved" })
    .slice(0, 3)
    .map((vehicle) => ({ ...vehicle, host: vehicle.ownerName })) as Vehicle[];

  return (
    <main className="landing-page">
      <section className="mobility-hero" aria-labelledby="hero-title">
        <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
        <div className="hero-grain" aria-hidden="true" />
        <div className="mobility-hero-inner">
          <div className="hero-copy-block">
            <div className="landing-eyebrow"><span className="eyebrow-pulse" /> CAMPUS MOBILITY, MADE SIMPLE</div>
            <h1 id="hero-title">Your day.<br />Your route.<br /><span>Your ride.</span></h1>
            <p className="hero-description">
              From a quick run across campus to a weekend out of town, find a ride that fits your plans — without the hassle.
            </p>
            <div className="hero-ctas">
              <Link className="landing-primary-cta" href="/rent">Find your ride <ArrowUpRight size={17} /></Link>
              <Link className="landing-text-cta" href="/list-your-vehicle">Have a vehicle? <span>Earn with it</span> <ArrowRight size={15} /></Link>
            </div>
            <div className="hero-proof-row">
              <div className="proof-avatars" aria-hidden="true"><span>R</span><span>K</span><span>A</span></div>
              <div><strong>Built around your campus</strong><small>Simple discovery. Clear pricing. Better trips.</small></div>
            </div>
          </div>

          <div className="hero-art" aria-label="A selection of vehicles available through MOBILITY">
            <div className="hero-art-topline"><span>MOVE AT YOUR PACE</span><span>01 — 03</span></div>
            <div className="hero-art-glow" />
            <div className="hero-vehicle-main">
              <Image src="/vehicles/ather-450x.png" alt="Electric scooter for everyday campus rides" fill priority sizes="(max-width: 700px) 92vw, 54vw" />
            </div>
            <div className="hero-vehicle-shadow" />
            <div className="floating-route-card route-card-top">
              <span className="route-icon"><MapPin size={15} /></span>
              <span><small>YOUR NEXT STOP</small><strong>Closer than you think</strong></span>
            </div>
            <div className="floating-route-card route-card-bottom">
              <span className="route-icon lime-icon"><Clock3 size={16} /></span>
              <span><small>YOUR TIME, YOUR TERMS</small><strong>Daily rides, your way</strong></span>
            </div>
            <div className="hero-art-caption"><span className="caption-dot" /> TWO-WHEELERS · CARS · YOUR CHOICE</div>
          </div>
        </div>
        <div className="hero-bottom-note"><span>MADE FOR EVERYDAY GETTING-THERE</span><ArrowDownRight size={16} /></div>
      </section>

      <section className="landing-search-section" id="find-a-ride" aria-label="Find a vehicle">
        <div className="landing-search-heading"><span>01 / FIND YOUR RIDE</span><p>Where are you headed?</p></div>
        <HomeSearch />
        <p className="search-reassurance"><ShieldCheck size={14} /> Browse first. Compare your options. Know the details before you book.</p>
      </section>

      <section className="landing-section category-section">
        <div className="landing-section-heading">
          <div><span className="section-kicker">PICK YOUR PACE</span><h2>One place.<br /><span>More ways to move.</span></h2></div>
          <p>Small everyday trips or a full-day plan — start with what you need, then find the ride that makes sense.</p>
        </div>
        <div className="category-grid">
          <Link href="/rent?wheels=2-Wheeler" className="category-tile category-two-wheel">
            <div className="category-copy"><span className="category-index">01 / QUICK & FLEXIBLE</span><h3>Two wheels.<br />More freedom.</h3><span className="category-link">Explore bikes & scooters <ArrowUpRight size={16} /></span></div>
            <div className="category-image"><Image src="/vehicles/royal-enfield.png" alt="" fill sizes="(max-width: 700px) 100vw, 50vw" /></div>
            <span className="category-icon"><Bike size={22} /></span>
          </Link>
          <Link href="/rent?wheels=4-Wheeler" className="category-tile category-four-wheel">
            <div className="category-copy"><span className="category-index">02 / ROOM FOR MORE</span><h3>Bring everyone.<br />Take the long way.</h3><span className="category-link">Explore cars & SUVs <ArrowUpRight size={16} /></span></div>
            <div className="category-image"><Image src="/vehicles/honda-city.png" alt="" fill sizes="(max-width: 700px) 100vw, 50vw" /></div>
            <span className="category-icon"><CarFront size={22} /></span>
          </Link>
        </div>
      </section>

      <section className="landing-section featured-section">
        <div className="landing-section-heading featured-heading">
          <div><span className="section-kicker">A FEW PLACES TO START</span><h2>Find your next<br /><span>favourite ride.</span></h2></div>
          <Link className="landing-outline-cta" href="/rent">Explore all vehicles <ArrowUpRight size={16} /></Link>
        </div>
        {featuredVehicles.length > 0 ? (
          <div className="vehicle-grid landing-vehicle-grid">
            {featuredVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
          </div>
        ) : (
          <div className="landing-empty-inventory">
            <span className="empty-inventory-icon"><Bike size={22} /></span>
            <div><h3>Your next ride starts here.</h3><p>There are no published vehicles to show right now. Check back soon or explore the full marketplace.</p></div>
            <Link href="/rent" className="landing-outline-cta">Browse marketplace <ArrowRight size={15} /></Link>
          </div>
        )}
        <p className="inventory-note"><span className="inventory-note-dot" /> Showing currently published listings. Vehicle availability and documentation should be confirmed before booking.</p>
      </section>

      <section className="how-section">
        <div className="how-section-inner">
          <div className="how-intro"><span className="section-kicker">LESS FIGURING OUT. MORE GETTING THERE.</span><h2>Three steps<br />to <span>go.</span></h2><p>Getting around should feel easy. We keep the journey straightforward, from the first search to the return.</p><Link href="/guidelines" className="landing-light-link">Read the ride guidelines <ArrowUpRight size={16} /></Link></div>
          <div className="how-steps">
            <article className="how-step"><span className="how-step-number">01</span><span className="how-step-icon"><MapPin size={20} /></span><h3>Find your fit</h3><p>Explore rides by city, vehicle type and daily rate. Compare the details before you decide.</p><span className="step-line" /></article>
            <article className="how-step"><span className="how-step-number">02</span><span className="how-step-icon"><Wallet size={20} /></span><h3>Review the details</h3><p>Check dates, pickup information, rental terms and the price breakdown before you continue.</p><span className="step-line" /></article>
            <article className="how-step"><span className="how-step-number">03</span><span className="how-step-icon"><Check size={20} /></span><h3>Make it a good trip</h3><p>Follow the handover checklist, ride responsibly and return the vehicle as agreed.</p><span className="step-line" /></article>
          </div>
        </div>
      </section>

      <section className="trust-section">
        <div className="trust-mark"><ShieldCheck size={24} /></div>
        <div className="trust-copy"><span className="section-kicker">TRUST SHOULD BE CLEAR, NOT A SLOGAN</span><h2>Know what you&apos;re booking.</h2><p>Review the listing, pickup details, rental terms and available documentation. We want the important information to be easy to find before you commit.</p></div>
        <Link href="/guidelines#verification" className="landing-outline-cta">How verification works <ArrowUpRight size={16} /></Link>
      </section>

      <section className="partner-section">
        <div className="partner-art" aria-hidden="true"><div className="partner-ring ring-one" /><div className="partner-ring ring-two" /><Sparkles className="partner-sparkle" size={22} /><div className="partner-mini-card"><span>YOUR VEHICLE</span><strong>Could go further.</strong><div className="partner-mini-lines"><i /><i /><i /></div></div></div>
        <div className="partner-copy"><span className="section-kicker">FOR OWNERS & LOCAL PARTNERS</span><h2>Your vehicle could be someone’s way forward.</h2><p>Bring your vehicle to a marketplace built around local travel. Create a listing, set your rates and share the pickup details that help renters make an informed choice.</p><div className="partner-benefits"><span><Check size={15} /> Set your listing details</span><span><Check size={15} /> Choose your rates</span><span><Check size={15} /> Manage your vehicles</span></div><Link href="/list-your-vehicle" className="landing-primary-cta">Become a vehicle partner <ArrowUpRight size={17} /></Link></div>
      </section>

      <section className="landing-last-cta"><div><span className="section-kicker">YOUR NEXT TRIP IS OUT THERE</span><h2>Let&apos;s get you<br /><span>moving.</span></h2></div><Link href="/rent" className="landing-primary-cta">Explore the marketplace <ArrowUpRight size={17} /></Link><span className="last-cta-decoration" aria-hidden="true">M.</span></section>
    </main>
  );
}
