"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ShieldCheck, RefreshCw } from "lucide-react";
import { seedVehicles, type Vehicle, type VehicleCategory } from "@/lib/data";
import { VehicleCard } from "@/components/vehicle-card";
import { DemoVehicleShowcase } from "@/components/demo-vehicle-showcase";

type RentalBasis = "Daily" | "Hourly";

function PriceRange({
  basis,
  min,
  max,
  valueMin,
  valueMax,
  onMinChange,
  onMaxChange,
}: {
  basis: RentalBasis;
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}) {
  const range = Math.max(max - min, 1);
  const minPercent = ((valueMin - min) / range) * 100;
  const maxPercent = ((valueMax - min) / range) * 100;
  const step = basis === "Hourly" ? 5 : 50;

  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", padding: "17px 20px 18px", flex: "1 1 320px", minWidth: 280 }} aria-label={`${basis} price range`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, marginBottom: 15 }}>
        <span style={{ font: "10px var(--mono)", color: "#85877c", textTransform: "uppercase", letterSpacing: "1px" }}>Price / {basis === "Hourly" ? "hour" : "day"}</span>
        <span style={{ fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" }}>₹{valueMin.toLocaleString("en-IN")} – ₹{valueMax.toLocaleString("en-IN")}</span>
      </div>
      <div style={{ position: "relative", height: 28, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: 4, borderRadius: 4, background: "#e1e3d8" }} />
        <div style={{ position: "absolute", left: `${minPercent}%`, right: `${100 - maxPercent}%`, height: 4, borderRadius: 4, background: "var(--lime)" }} />
        <input
          aria-label={`Minimum ${basis.toLowerCase()} price`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={(e) => onMinChange(Math.min(Number(e.target.value), valueMax - step))}
          style={{ position: "absolute", width: "100%", height: 28, margin: 0, appearance: "none", WebkitAppearance: "none", background: "transparent", pointerEvents: "none", outline: "none", zIndex: 3 }}
        />
        <input
          aria-label={`Maximum ${basis.toLowerCase()} price`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={(e) => onMaxChange(Math.max(Number(e.target.value), valueMin + step))}
          style={{ position: "absolute", width: "100%", height: 28, margin: 0, appearance: "none", WebkitAppearance: "none", background: "transparent", pointerEvents: "none", outline: "none", zIndex: 4 }}
        />
        <style>{`
          .price-range-filter input[type="range"]::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:18px; height:18px; border-radius:50%; background:#171915; border:3px solid #fff; box-shadow:0 1px 5px rgba(23,25,21,.25); cursor:grab; pointer-events:auto; }
          .price-range-filter input[type="range"]::-moz-range-thumb { width:14px; height:14px; border-radius:50%; background:#171915; border:3px solid #fff; box-shadow:0 1px 5px rgba(23,25,21,.25); cursor:grab; pointer-events:auto; }
          .price-range-filter input[type="range"]::-webkit-slider-runnable-track { height:4px; background:transparent; }
          .price-range-filter input[type="range"]::-moz-range-track { height:4px; background:transparent; }
        `}</style>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2, color: "#85877c", font: "9px var(--mono)" }}>
        <span>₹{min.toLocaleString("en-IN")}</span>
        <span>₹{max.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}

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
  const [rentalBasis, setRentalBasis] = useState<RentalBasis>("Daily");
  const [sort, setSort] = useState("Recommended");
  const getPrice = (vehicle: Vehicle) => rentalBasis === "Hourly" ? vehicle.hourlyPrice ?? Math.round(vehicle.price / 24) : vehicle.price;

  const priceBounds = useMemo(() => {
    const prices = inventory.map(getPrice).filter((price) => Number.isFinite(price) && price > 0);
    if (!prices.length) return { min: 0, max: 1000 };
    const min = Math.floor(Math.min(...prices) / 10) * 10;
    const max = Math.ceil(Math.max(...prices) / 10) * 10;
    return { min, max: Math.max(max, min + (rentalBasis === "Hourly" ? 5 : 50)) };
  }, [inventory, rentalBasis]);

  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(1000);

  useEffect(() => {
    setPriceMin(priceBounds.min);
    setPriceMax(priceBounds.max);
  }, [priceBounds.min, priceBounds.max]);

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
        id: v.id, name: v.name, make: v.make, category: v.category, wheels: v.wheels, city: v.city,
        campusZone: v.campusZone, pickupAddress: v.pickupAddress, price: v.price, hourlyPrice: v.hourlyPrice,
        deposit: v.deposit, seats: v.seats, transmission: v.transmission, fuel: v.fuel, year: v.year,
        rating: v.rating || 5, trips: v.trips || 0, image: v.image, description: v.description,
        host: v.ownerName || "Vehicle host", ownerId: v.ownerId, registrationNumber: v.registrationNumber,
        insuranceValidTill: v.insuranceValidTill, rcVerified: v.rcVerified ?? false,
        insuranceVerified: v.insuranceVerified ?? false, helmetOption: v.helmetOption,
        helmetCondition: v.helmetCondition, guidelines: v.guidelines, hostNotes: v.hostNotes, status: v.status,
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

  useEffect(() => { fetchVehicles(); }, []);

  const list = useMemo(() => inventory
    .filter((v) => {
      const textMatches = [v.name, v.make, v.city, v.campusZone || "", v.category, v.wheels || ""].join(" ").toLowerCase().includes(query.toLowerCase());
      const cityMatches = city === "All locations" || v.city.toLowerCase() === city.toLowerCase();
      const catMatches = category === "All types" || v.category === category;
      const wheelMatches = wheelType === "All vehicles" || v.wheels === wheelType;
      const price = getPrice(v);
      return textMatches && cityMatches && catMatches && wheelMatches && price >= priceMin && price <= priceMax;
    })
    .sort((a, b) => {
      const priceA = getPrice(a); const priceB = getPrice(b);
      return sort === "Price: low to high" ? priceA - priceB
        : sort === "Price: high to low" ? priceB - priceA
        : sort === "Top Rated" ? b.rating - a.rating
        : b.rating * 10 + b.trips - (a.rating * 10 + a.trips);
    }), [inventory, query, city, category, wheelType, rentalBasis, priceMin, priceMax, sort]);

  const resetFilters = () => {
    setQuery(""); setCity("All locations"); setCategory("All types"); setWheelType("All vehicles");
    setRentalBasis("Daily"); setSort("Recommended");
  };

  return (
    <main className="page-shell">
      <div className="page-top">
        <div><div className="eyebrow">Explore the marketplace</div><h1 className="page-heading">Find your kind<br />of drive.</h1></div>
        <p className="page-intro">Browse bikes, scooters and cars by city, vehicle type and price. Check each listing’s pickup details, documentation status and rental terms before you decide.</p>
      </div>

      <div className="filter-bar">
        <label style={{ position: "relative", flex: "1 1 240px" }}>
          <Search size={16} style={{ position: "absolute", left: 13, top: 14, color: "#85877c" }} />
          <input aria-label="Search vehicles" placeholder="Search make, model, zone, or city" value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: "100%", paddingLeft: 39 }} />
        </label>
        <select aria-label="Rental basis" value={rentalBasis} onChange={(e) => setRentalBasis(e.target.value as RentalBasis)}><option>Daily</option><option>Hourly</option></select>
        <select aria-label="Filter by wheels" value={wheelType} onChange={(e) => setWheelType(e.target.value)}><option>All vehicles</option><option>2-Wheeler</option><option>4-Wheeler</option></select>
        <select aria-label="Filter by city" value={city} onChange={(e) => setCity(e.target.value)}><option>All locations</option>{["Chennai", "Bengaluru", "Kochi", "Coimbatore", "Hyderabad", "Mumbai"].map((c) => <option key={c}>{c}</option>)}</select>
        <select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)}><option>All types</option>{(["Bike", "Scooter", "Hatchback", "Sedan", "SUV", "Electric"] as VehicleCategory[]).map((c) => <option key={c}>{c}</option>)}</select>
        <select aria-label="Sort vehicles" value={sort} onChange={(e) => setSort(e.target.value)}><option>Recommended</option><option>Price: low to high</option><option>Price: high to low</option><option>Top Rated</option></select>
      </div>

      <div className="price-filter-card" style={{ display: "flex", alignItems: "stretch", gap: 10, marginBottom: 28 }}>
        <PriceRange basis={rentalBasis} min={priceBounds.min} max={priceBounds.max} valueMin={priceMin} valueMax={priceMax} onMinChange={setPriceMin} onMaxChange={setPriceMax} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div className="result-count" style={{ marginBottom: 0 }} aria-live="polite"><SlidersHorizontal size={12} style={{ display: "inline", marginRight: 7 }} />{loading ? "Finding available rides…" : `${list.length} vehicles matching your filters`}</div>
        <button type="button" onClick={fetchVehicles} style={{ background: "none", border: 0, fontSize: 11, fontFamily: "var(--mono)", color: "#6b7280", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}><RefreshCw size={11} /> Refresh inventory</button>
      </div>

      {loading ? <div className="empty-state" role="status"><h3>Finding your next ride…</h3><p className="muted">Checking the current marketplace inventory.</p></div>
        : inventoryError && inventory.length === 0 ? <div className="empty-state" role="alert"><h3>We couldn’t load the live marketplace.</h3><p className="muted">Please try refreshing. Example vehicles are hidden until we can confirm there are no live listings.</p></div>
        : list.length ? <div className="vehicle-grid">{list.map((v) => <VehicleCard key={v.id} vehicle={v} rentalBasis={rentalBasis} />)}</div>
        : inventory.length === 0 ? <div className="empty-state"><h3>No live vehicles are listed right now.</h3><p className="muted">Example vehicles below are for display only and cannot be booked.</p></div>
        : <div className="empty-state"><h3>No vehicles matching your criteria.</h3><p className="muted">Try adjusting your location, vehicle type, rental basis or price range to view other available options.</p><button className="button-primary" style={{ marginTop: 15 }} onClick={resetFilters}>Clear all filters</button></div>}
      {!loading && !inventoryError && inventory.length === 0 && <DemoVehicleShowcase />}

      <div style={{ marginTop: 40, padding: "18px 22px", background: "#ffffff", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><ShieldCheck size={20} className="text-[#657d24]" /><div><div style={{ fontWeight: 700, fontSize: 13 }}>Institutional &amp; Regulatory Standard</div><p className="muted" style={{ margin: 0 }}>Documentation and safety details vary by listing. Review the information shown for each vehicle and confirm any required documents with the host before booking.</p></div></div>
      </div>
    </main>
  );
}

export default function RentPage() {
  return <Suspense fallback={<main className="page-shell"><p className="page-intro">Loading verified vehicle fleet…</p></main>}><RentContent /></Suspense>;
}
