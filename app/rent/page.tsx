"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  ArrowDownUp,
  Check,
  ChevronDown,
  Compass,
  Crosshair,
  Map,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  LayoutGrid,
} from "lucide-react";
import { seedVehicles, type Vehicle, type VehicleCategory } from "@/lib/data";
import { readDemoBookings } from "@/lib/demo-client-store";
import { VehicleCard } from "@/components/vehicle-card";
import { DemoVehicleShowcase } from "@/components/demo-vehicle-showcase";
import { CAMPUS_ZONES, getCampusZonesByCity, haversineDistance } from "@/lib/campus-zones";

const CampusMap = dynamic(
  () => import("@/components/campus-map").then((mod) => mod.CampusMap),
  { ssr: false }
);

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
  const [selectedCampusZone, setSelectedCampusZone] = useState("All campus zones");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [radiusFilter, setRadiusFilter] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const cityCampusZones = useMemo(() => getCampusZonesByCity(city), [city]);

  const handleLocateMe = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocateError("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let label = `Near My Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
        try {
          const res = await fetch(`/api/geo/reverse?lat=${latitude}&lng=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            if (data.result?.shortName) {
              label = `Near ${data.result.shortName}`;
            }
          }
        } catch {}
        setUserLocation({ lat: latitude, lng: longitude, label });
        setSort("Distance: Nearest First");
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setLocateError("Location access unavailable. Select a campus zone manually.");
      },
      { timeout: 7000 }
    );
  };

  const handleCampusZoneChange = (zoneId: string) => {
    setSelectedCampusZone(zoneId);
    if (zoneId === "All campus zones") {
      setUserLocation(null);
    } else {
      const zone = CAMPUS_ZONES.find((z) => z.id === zoneId);
      if (zone) {
        setUserLocation({
          lat: zone.coordinates.lat,
          lng: zone.coordinates.lng,
          label: `Near ${zone.name}`,
        });
        setSort("Distance: Nearest First");
      }
    }
  };

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
        latitude: v.latitude, longitude: v.longitude,
      }));
      // Unconfigured production intentionally returns no server inventory.
      // Keep the preview browsable using local demo bookings for date conflicts.
      const fallbackVehicles = seedVehicles.filter((vehicle) =>
        !initialStart || !initialEnd || !readDemoBookings().some((booking) =>
          booking.vehicleId === vehicle.id &&
          !["CANCELLED", "COMPLETED"].includes(booking.status) &&
          initialStart <= booking.end &&
          initialEnd >= booking.start
        )
      );
      setInventory(formatted.length === 0 ? fallbackVehicles : formatted);
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

  const list = useMemo(() => {
    return inventory
      .map((v) => {
        if (userLocation && typeof v.latitude === "number" && typeof v.longitude === "number") {
          const distanceKm = haversineDistance(userLocation.lat, userLocation.lng, v.latitude, v.longitude);
          return { ...v, distanceKm };
        }
        return v;
      })
      .filter((v) => {
        const textMatches = [v.name, v.make, v.city, v.campusZone || "", v.category, v.wheels || ""]
          .join(" ").toLowerCase().includes(query.trim().toLowerCase());
        const cityMatches = city === "All locations" || v.city.toLowerCase() === city.toLowerCase();
        const categoryMatches = category === "All types" || v.category === category;
        const wheelMatches = wheelType === "All vehicles" || v.wheels === wheelType;
        const priceMatches = v.price >= selectedMin && v.price <= selectedMax;
        const radiusMatches = radiusFilter === null || ((v as any).distanceKm !== undefined && (v as any).distanceKm <= radiusFilter);
        return textMatches && cityMatches && categoryMatches && wheelMatches && priceMatches && radiusMatches;
      })
      .sort((a, b) => {
        if (sort === "Distance: Nearest First") {
          const distA = typeof (a as any).distanceKm === "number" ? (a as any).distanceKm : 9999;
          const distB = typeof (b as any).distanceKm === "number" ? (b as any).distanceKm : 9999;
          return distA - distB;
        }
        return sort === "Price: low to high" ? a.price - b.price
          : sort === "Price: high to low" ? b.price - a.price
          : sort === "Top Rated" ? b.rating - a.rating
          : (b.rating * 10 + b.trips) - (a.rating * 10 + a.trips);
      });
  }, [inventory, query, city, category, wheelType, selectedMin, selectedMax, sort, userLocation, radiusFilter]);

  const hasFilters = Boolean(query || city !== "All locations" || category !== "All types"
    || wheelType !== "All vehicles" || minPriceFilter !== null || maxPriceFilter !== null || userLocation !== null || radiusFilter !== null);

  const clearFilters = () => {
    setQuery("");
    setCity("All locations");
    setCategory("All types");
    setWheelType("All vehicles");
    setMinPriceFilter(null);
    setMaxPriceFilter(null);
    setSelectedCampusZone("All campus zones");
    setUserLocation(null);
    setRadiusFilter(null);
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
          <p className="page-intro" style={{ fontSize: 11, marginTop: 14 }}>Demo preview · Bookings and trip updates stay on this device. No real payments or deposits are processed.</p>
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
              <option>Recommended</option>
              {userLocation && <option>Distance: Nearest First</option>}
              <option>Price: low to high</option>
              <option>Price: high to low</option>
              <option>Top Rated</option>
            </select><ChevronDown size={14} />
          </label>
        </div>

        {/* GEOSPATIAL PROXIMITY & CAMPUS ZONE CONTROLS */}
        <div style={{ background: "#f8f9f2", border: "1px solid #e7e9df", padding: "14px 16px", marginBottom: 16, borderRadius: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontFamily: "var(--mono)", color: "#546e14", fontWeight: 700 }}>
              <Compass size={14} /> CAMPUS PROXIMITY DISCOVERY
            </div>
            {userLocation && (
              <span style={{ fontSize: 11, color: "#364121", background: "#e9f2d0", padding: "3px 8px", borderRadius: 2, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#658a18" }} />
                {userLocation.label}
                <button
                  type="button"
                  onClick={() => {
                    setUserLocation(null);
                    setSelectedCampusZone("All campus zones");
                    if (sort === "Distance: Nearest First") setSort("Recommended");
                  }}
                  style={{ border: "none", background: "transparent", color: "#666", cursor: "pointer", marginLeft: 4, fontWeight: 700 }}
                  title="Clear proximity"
                >
                  ×
                </button>
              </span>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 12 }}>
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocating}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 14px",
                background: userLocation && !selectedCampusZone.startsWith("All") ? "#fff" : "#171915",
                color: userLocation && !selectedCampusZone.startsWith("All") ? "#171915" : "#fff",
                border: "1px solid #171915",
                borderRadius: 2,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <Crosshair size={14} color="#c8ff3a" />
              {isLocating ? "Detecting Location…" : "Find Rides Near Me"}
            </button>

            <label className="market-select-field" style={{ padding: "8px 12px" }}>
              <span style={{ fontSize: 8 }}>Campus Zone Depot</span>
              <select
                aria-label="Filter by campus zone"
                value={selectedCampusZone}
                onChange={(e) => handleCampusZoneChange(e.target.value)}
                style={{ fontSize: 11 }}
              >
                <option value="All campus zones">All campus zones</option>
                {cityCampusZones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({z.code})
                  </option>
                ))}
              </select>
            </label>

            <label className="market-select-field" style={{ padding: "8px 12px" }}>
              <span style={{ fontSize: 8 }}>Proximity Radius</span>
              <select
                aria-label="Filter by proximity radius"
                value={radiusFilter === null ? "Any radius" : String(radiusFilter)}
                onChange={(e) => setRadiusFilter(e.target.value === "Any radius" ? null : Number(e.target.value))}
                style={{ fontSize: 11 }}
              >
                <option value="Any radius">Any distance radius</option>
                <option value="2">Within 2 km (Walking / Bicycle)</option>
                <option value="5">Within 5 km (Campus Perimeter)</option>
                <option value="10">Within 10 km (Suburban Transit)</option>
                <option value="25">Within 25 km (Regional Corridor)</option>
              </select>
            </label>
          </div>

          {locateError && (
            <div style={{ color: "#b91c1c", fontSize: 11, marginTop: 8 }}>
              {locateError}
            </div>
          )}
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
        <div>
          <span className="market-results-eyebrow">THE LINEUP</span>
          <p aria-live="polite">
            {loading ? "Finding available rides…" : (
              <>
                <strong>{list.length}</strong> {list.length === 1 ? "ride" : "rides"} matching your search
                {userLocation && <span> · sorted by distance</span>}
              </>
            )}
          </p>
        </div>

        <div className="market-results-actions">
          {/* VIEW MODE TOGGLE */}
          <div style={{ display: "inline-flex", background: "#f1f3e8", padding: 2, borderRadius: 2, border: "1px solid #e0e3d4" }}>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 10px",
                background: viewMode === "grid" ? "#171915" : "transparent",
                color: viewMode === "grid" ? "#fff" : "#555",
                border: "none",
                borderRadius: 2,
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "var(--mono)",
                cursor: "pointer",
              }}
            >
              <LayoutGrid size={12} /> Grid View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 10px",
                background: viewMode === "map" ? "#171915" : "transparent",
                color: viewMode === "map" ? "#fff" : "#555",
                border: "none",
                borderRadius: 2,
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "var(--mono)",
                cursor: "pointer",
              }}
            >
              <Map size={12} /> Interactive Map
            </button>
          </div>

          {hasFilters && <span className="market-filter-active"><span /> Filters active</span>}
          <button type="button" onClick={fetchVehicles} disabled={loading} className="market-refresh-button">
            <RotateCcw size={13} className={loading ? "market-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="market-loading-state" role="status"><div className="market-loading-orbit"><span /></div><h3>Finding your next ride</h3><p>Matching the details to your plans…</p></div>
      ) : inventoryError && inventory.length === 0 ? (
        <div className="empty-state" role="alert"><h3>We couldn’t load the live marketplace.</h3><p className="muted">Please try refreshing. Example vehicles are hidden until we can confirm there are no live listings.</p></div>
      ) : viewMode === "map" ? (
        <div style={{ marginBottom: 32, background: "#fff", border: "1px solid #e2e4d9", borderRadius: 3, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "#546e14", fontWeight: 700 }}>
              CAMPUS & URBAN GEOSPATIAL FLEET MAP · {list.filter((v) => v.latitude && v.longitude).length} PLOTTED VEHICLES
            </div>
            <div style={{ fontSize: 10, color: "#8a8e80" }}>
              Click any pin for pricing & specs
            </div>
          </div>
          <CampusMap
            vehicles={list
              .filter((v) => typeof v.latitude === "number" && typeof v.longitude === "number")
              .map((v) => ({
                id: v.id,
                lat: v.latitude!,
                lng: v.longitude!,
                title: `${v.make} ${v.name}`,
                subtitle: `${v.campusZone || v.city} · ${v.wheels}`,
                price: v.price,
                tag: v.category,
                type: "vehicle",
              }))}
            campusZones={cityCampusZones.map((z) => ({
              id: z.id,
              lat: z.coordinates.lat,
              lng: z.coordinates.lng,
              title: z.name,
              subtitle: z.description,
              tag: z.code,
              type: "zone",
            }))}
            pickup={userLocation ? { lat: userLocation.lat, lng: userLocation.lng, label: userLocation.label } : undefined}
            height="520px"
          />
        </div>
      ) : list.length ? (
        <div className="vehicle-grid market-vehicle-grid">{list.map((v, i) => <div className="market-card-reveal" key={v.id} style={{ "--card-index": i } as React.CSSProperties}><VehicleCard vehicle={v} /></div>)}</div>
      ) : inventory.length === 0 ? (
        <div className="empty-state"><h3>No live vehicles are listed right now.</h3><p className="muted">Example vehicles below are for display only and cannot be booked.</p></div>
      ) : (
        <div className="market-empty-state"><div className="market-empty-icon"><Search size={22} /></div><h3>No rides in this range. Yet.</h3><p>Try widening your budget or clearing a filter to bring more options into view.</p><button className="button-primary" onClick={clearFilters}>Clear all filters <RotateCcw size={14} /></button></div>
      )}
      {!loading && !inventoryError && inventory.length === 0 && <DemoVehicleShowcase />}

      <div className="market-trust-note"><div className="market-trust-icon"><ShieldCheck size={21} /></div><div><strong>Know before you go.</strong><p>Documentation and safety details vary by listing. Review each vehicle’s information and confirm required documents with the host before booking.</p></div><span className="market-trust-mark">MOBILITY / VERIFIED DETAILS</span></div>
    </main>
  );
}

export default function RentPage() {
  return <Suspense fallback={<main className="page-shell"><p className="page-intro">Loading vehicle fleet…</p></main>}><RentContent /></Suspense>;
}
