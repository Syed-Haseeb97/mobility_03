"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowDownUp,
  Check,
  ChevronDown,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { seedVehicles, type Vehicle, type VehicleCategory } from "@/lib/data";
import { VehicleCard } from "@/components/vehicle-card";
import { DemoVehicleShowcase } from "@/components/demo-vehicle-showcase";

function RentContent() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get("city") || "All locations";
  const initialWheels = searchParams.get("wheels") || "All vehicles";
  const initialStart = searchParams.get("start") || "";
  const initialEnd = searchParams.get("end") || "";

  const [inventory, setInventory] = useState<Vehicle[]>(seedVehicles);
  const [loading, setLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState(false);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(initialCity === "" ? "All locations" : initialCity);
  const [category, setCategory] = useState("All types");
  const [wheelType, setWheelType] = useState(initialWheels);
  const [sort, setSort] = useState("Recommended");
  const [minPriceFilter, setMinPriceFilter] = useState<number | null>(null);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);

  const priceBounds = useMemo(() => {
    const prices = inventory.map((vehicle) => Number(vehicle.price) || 0).filter((price) => price >= 0);
    if (!prices.length) return { min: 0, max: 5000 };
    const min = Math.floor(Math.min(...prices) / 100) * 100;
    const max = Math.max(min + 100, Math.ceil(Math.max(...prices) / 100) * 100);
    return { min, max };
  }, [inventory]);

  const selectedMin = minPriceFilter ?? priceBounds.min;
  const selectedMax = maxPriceFilter ?? priceBounds.max;

  const fetchVehicles = async () => {
    setLoading(true);
    setInventoryError(false);
    try {
      const params = new URLSearchParams();
      if (initialStart) params.set("start", initialStart);
      if (initialEnd) params.set("end", initialEnd);
      const queryString = params.toString();
      const res = await fetch(queryString ? `/api/vehicles?${queryString}` : "/api/vehicles");
      if (!res.ok) throw new Error(`Vehicle inventory request failed (${res.status})`);
      const data = await res.json();
      if (!Array.isArray(data.vehicles)) throw new Error("Vehicle inventory response did not include a vehicles array");

      const formatted: Vehicle[] = data.vehicles.map((v: any) => ({
        id: v.id, name: v.name, make: v.make, category: v.category, wheels: v.wheels,
        city: v.city, campusZone: v.campusZone, pickupAddress: v.pickupAddress,
        price: v.price, hourlyPrice: v.hourlyPrice, deposit: v.deposit, seats: v.seats,
        transmission: v.transmission, fuel: v.fuel, year: v.year, rating: v.rating || 5,
        trips: v.trips || 0, image: v.image, description: v.description,
        host: v.ownerName || "Vehicle host", ownerId: v.ownerId,
        registrationNumber: v.registrationNumber, insuranceValidTill: v.insuranceValidTill,
        rcVerified: v.rcVerified ?? false, insuranceVerified: v.insuranceVerified ?? false,
        helmetOption: v.helmetOption, helmetCondition: v.helmetCondition,
        guidelines: v.guidelines, hostNotes: v.hostNotes, status: v.status,
      }));
      setInventory(formatted);
    } catch (err) {
      console.warn("Unable to load vehicle inventory", err);
      setInventoryError(true);
      setInventory(seedVehicles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const list = useMemo(() => inventory
    .filter((v) => {
      const textMatches = [v.name, v.make, v.city, v.campusZone || "", v.category, v.wheels || ""]
        .join(" ").toLowerCase().includes(query.trim().toLowerCase());
      const cityMatches = city === "All locations" || v.city.toLowerCase() === city.toLowerCase();
      const categoryMatches = category === "All types" || v.category === category;
      const wheelMatches = wheelType === "All vehicles" || v.wheels === wheelType;
      const priceMatches = v.price >= selectedMin && v.price <= selectedMax;
      return textMatches && cityMatches && categoryMatches && wheelMatches && priceMatches;
    })
    .sort((a, b) => sort === "Price: low to high" ? a.price - b.price
      : sort === "Price: high to low" ? b.price - a.price
      : sort === "Top Rated" ? b.rating - a.rating
      : (b.rating * 10 + b.trips) - (a.rating * 10 + a.trips)),
  [inventory, query, city, category, wheelType, selectedMin, selectedMax, sort]);

  const hasFilters = Boolean(query || city !== "All locations" || category !== "All types"
    || wheelType !== "All vehicles" || minPriceFilter !== null || maxPriceFilter !== null);

  const clearFilters = () => {
    setQuery("");
    setCity("All locations");
    setCategory("All types");
    setWheelType("All vehicles");
    setMinPriceFilter(null);
    setMaxPriceFilter(null);
    setSort("Recommended");
  };

  return (
    <main className="page-shell rent-marketplace">
      <div className="rent-intro">
        <div className="rent-intro-copy">
          <div className="eyebrow"><span className="rent-live-dot" /> Explore the marketplace</div>
          <h1 className="page-heading">Find your kind<br /><span>of drive.</span></h1>
          <p className="page-intro">The right ride, at the right price. Fine-tune your search and discover bikes, scooters and cars that fit your day.</p>
          <div className="rent-intro-proof"><span><Check size={14} /> Clear daily pricing</span><span><Check size={14} /> Compare in seconds</span></div>
        </div>
        <div className="rent-intro-art" aria-hidden="true">
          <div className="rent-art-orbit rent-art-orbit-a" />
          <div className="rent-art-orbit rent-art-orbit-b" />
          <div className="rent-art-label"><Sparkles size={14} /> THE MOBILITY EDIT</div>
          <div className="rent-art-number">01<span> / DISCOVER</span></div>
          <div className="rent-art-caption">Your next trip<br />starts here.</div>
        </div>
      </div>

      <section className="market-filter-panel" aria-label="Filter and sort vehicles">
        <div className="market-filter-heading">
          <div><span className="market-filter-kicker">MAKE IT YOURS</span><h2>Find your fit<span>.</span></h2></div>
          <button type="button" className="market-reset-button" onClick={clearFilters} disabled={!hasFilters && sort === "Recommended"}><RotateCcw size={14} /> Reset filters</button>
        </div>

        <div className="market-search-row">
          <label className="market-search-field">
            <Search size={17} />
            <input aria-label="Search vehicles" placeholder="Search make, model, zone or city…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <kbd>⌕</kbd>
          </label>
          <label className="market-sort-field"><ArrowDownUp size={15} /><span className="sr-only">Sort vehicles</span>
            <select aria-label="Sort vehicles" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option>Recommended</option><option>Price: low to high</option><option>Price: high to low</option><option>Top Rated</option>
            </select><ChevronDown size={14} />
          </label>
        </div>

        <div className="market-filter-grid">
          <label className="market-select-field"><span>Vehicle type</span><select aria-label="Filter by wheels" value={wheelType} onChange={(e) => setWheelType(e.target.value)}><option>All vehicles</option><option>2-Wheeler</option><option>4-Wheeler</option></select></label>
          <label className="market-select-field"><span>Category</span><select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)}><option>All types</option>{(["Bike", "Scooter", "Hatchback", "Sedan", "SUV", "Electric"] as VehicleCategory[]).map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="market-select-field"><span>Pickup location</span><select aria-label="Filter by city" value={city} onChange={(e) => setCity(e.target.value)}><option>All locations</option>{["Chennai", "Bengaluru", "Kochi", "Coimbatore", "Hyderabad", "Mumbai"].map((c) => <option key={c}>{c}</option>)}</select></label>
        </div>

        <div className="market-price-filter">
          <div className="market-price-heading"><div><span className="market-filter-kicker">YOUR BUDGET</span><h3>Daily price range</h3></div><div className="market-price-value">₹{selectedMin.toLocaleString("en-IN")} <span>—</span> ₹{selectedMax.toLocaleString("en-IN")}<small> / day</small></div></div>
          <div className="market-range-inputs">
            <span className="market-range-selected" aria-hidden="true" style={{ left: `${priceBounds.max === priceBounds.min ? 0 : ((selectedMin - priceBounds.min) / (priceBounds.max - priceBounds.min)) * 100}%`, width: `${priceBounds.max === priceBounds.min ? 100 : ((selectedMax - selectedMin) / (priceBounds.max - priceBounds.min)) * 100}%` }} />
            <input aria-label="Minimum daily price" type="range" min={priceBounds.min} max={priceBounds.max} step="50" value={Math.min(selectedMin, selectedMax)} onChange={(e) => { const value = Number(e.target.value); setMinPriceFilter(Math.min(value, selectedMax)); }} style={{ "--range-progress": `${priceBounds.max === priceBounds.min ? 0 : ((selectedMin - priceBounds.min) / (priceBounds.max - priceBounds.min)) * 100}%` } as React.CSSProperties} />
            <input aria-label="Maximum daily price" type="range" min={priceBounds.min} max={priceBounds.max} step="50" value={Math.max(selectedMax, selectedMin)} onChange={(e) => { const value = Number(e.target.value); setMaxPriceFilter(Math.max(value, selectedMin)); }} style={{ "--range-progress": `${priceBounds.max === priceBounds.min ? 100 : ((selectedMax - priceBounds.min) / (priceBounds.max - priceBounds.min)) * 100}%` } as React.CSSProperties} />
          </div>
          <div className="market-range-labels"><span>₹{priceBounds.min.toLocaleString("en-IN")}</span><span>₹{priceBounds.max.toLocaleString("en-IN")}+</span></div>
        </div>
      </section>

      <div className="market-results-toolbar">
        <div><span className="market-results-eyebrow">THE LINEUP</span><p aria-live="polite">{loading ? "Finding available rides…" : <><strong>{list.length}</strong> {list.length === 1 ? "ride" : "rides"} matching your search</>}</p></div>
        <div className="market-results-actions">{hasFilters && <span className="market-filter-active"><span /> Filters active</span>}<button type="button" onClick={fetchVehicles} disabled={loading} className="market-refresh-button"><RotateCcw size={13} className={loading ? "market-spin" : ""} /> Refresh</button></div>
      </div>

      {loading ? <div className="market-loading-state" role="status"><div className="market-loading-orbit"><span /></div><h3>Finding your next ride</h3><p>Matching the details to your plans…</p></div>
      : inventoryError && inventory.length === 0 ? <div className="empty-state" role="alert"><h3>We couldn’t load the live marketplace.</h3><p className="muted">Please try refreshing. Example vehicles are hidden until we can confirm there are no live listings.</p></div>
      : list.length ? <div className="vehicle-grid market-vehicle-grid">{list.map((v, i) => <div className="market-card-reveal" key={v.id} style={{ "--card-index": i } as React.CSSProperties}><VehicleCard vehicle={v} /></div>)}</div>
      : inventory.length === 0 ? <div className="empty-state"><h3>No live vehicles are listed right now.</h3><p className="muted">Example vehicles below are for display only and cannot be booked.</p></div>
      : <div className="market-empty-state"><div className="market-empty-icon"><Search size={22} /></div><h3>No rides in this range. Yet.</h3><p>Try widening your budget or clearing a filter to bring more options into view.</p><button className="button-primary" onClick={clearFilters}>Clear all filters <RotateCcw size={14} /></button></div>}
      {!loading && !inventoryError && inventory.length === 0 && <DemoVehicleShowcase />}

      <div className="market-trust-note"><div className="market-trust-icon"><ShieldCheck size={21} /></div><div><strong>Know before you go.</strong><p>Documentation and safety details vary by listing. Review each vehicle’s information and confirm required documents with the host before booking.</p></div><span className="market-trust-mark">MOBILITY / VERIFIED DETAILS</span></div>
    </main>
  );
}

export default function RentPage() {
  return <Suspense fallback={<main className="page-shell"><p className="page-intro">Loading vehicle fleet…</p></main>}><RentContent /></Suspense>;
}
