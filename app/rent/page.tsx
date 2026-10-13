"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ShieldCheck, HardHat, RefreshCw } from "lucide-react";
import { seedVehicles, type Vehicle, type VehicleCategory } from "@/lib/data";
import { VehicleCard } from "@/components/vehicle-card";
import { DemoVehicleShowcase } from "@/components/demo-vehicle-showcase";

function RentContent() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get("city") || "All locations";
  const initialWheels = searchParams.get("wheels") || "All vehicles";
  const initialStart = searchParams.get("start") || "";
  const initialEnd = searchParams.get("end") || "";

  const [inventory, setInventory] = useState<Vehicle[]>(
    process.env.NODE_ENV === "production" ? [] : seedVehicles
  );
  const [loading, setLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState(false);

  const [query, setQuery] = useState("");
  const [city, setCity] = useState(initialCity === "" ? "All locations" : initialCity);
  const [category, setCategory] = useState("All types");
  const [wheelType, setWheelType] = useState(initialWheels);
  const [rateFilter, setRateFilter] = useState("All rates");
  const [sort, setSort] = useState("Recommended");

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
      if (!Array.isArray(data.vehicles)) {
        throw new Error("Vehicle inventory response did not include a vehicles array");
      }

      // An empty API result is real: do not replace it with seed inventory.
      const formatted: Vehicle[] = data.vehicles.map((v: any) => ({
        id: v.id,
        name: v.name,
        make: v.make,
        category: v.category,
        wheels: v.wheels,
        city: v.city,
        campusZone: v.campusZone,
        pickupAddress: v.pickupAddress,
        price: v.price,
        hourlyPrice: v.hourlyPrice,
        deposit: v.deposit,
        seats: v.seats,
        transmission: v.transmission,
        fuel: v.fuel,
        year: v.year,
        rating: v.rating || 5,
        trips: v.trips || 0,
        image: v.image,
        description: v.description,
        host: v.ownerName || "Vehicle host",
        ownerId: v.ownerId,
        registrationNumber: v.registrationNumber,
        insuranceValidTill: v.insuranceValidTill,
        rcVerified: v.rcVerified ?? false,
        insuranceVerified: v.insuranceVerified ?? false,
        helmetOption: v.helmetOption,
        helmetCondition: v.helmetCondition,
        guidelines: v.guidelines,
        hostNotes: v.hostNotes,
        status: v.status,
      }));
      setInventory(formatted);
    } catch (err) {
      console.warn("Unable to load vehicle inventory", err);
      setInventoryError(true);
      setInventory(process.env.NODE_ENV === "production" ? [] : seedVehicles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const list = useMemo(
    () =>
      inventory
        .filter((v) => {
          const textMatches = [v.name, v.make, v.city, v.campusZone || "", v.category, v.wheels || ""]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase());

          const cityMatches = city === "All locations" || v.city.toLowerCase() === city.toLowerCase();
          const catMatches = category === "All types" || v.category === category;
          const wheelMatches = wheelType === "All vehicles" || v.wheels === wheelType;
          const rateMatches =
            rateFilter === "All rates" ||
            (rateFilter === "Under ₹1,000/day" && v.price < 1000);

          return textMatches && cityMatches && catMatches && wheelMatches && rateMatches;
        })
        .sort((a, b) =>
          sort === "Price: low to high"
            ? a.price - b.price
            : sort === "Price: high to low"
            ? b.price - a.price
            : sort === "Top Rated"
            ? b.rating - a.rating
            : b.rating * 10 + b.trips - (a.rating * 10 + a.trips)
        ),
    [inventory, query, city, category, wheelType, rateFilter, sort]
  );

  return (
    <main className="page-shell">
      <div className="page-top">
        <div>
          <div className="eyebrow">Explore the marketplace</div>
          <h1 className="page-heading">
            Find your kind
            <br />
            of drive.
          </h1>
        </div>
        <p className="page-intro">
          Browse bikes, scooters and cars by city, vehicle type and price. Check each listing’s pickup details, documentation status and rental terms before you decide.
        </p>
      </div>

      <div className="filter-bar">
        <label style={{ position: "relative", flex: "1 1 240px" }}>
          <Search
            size={16}
            style={{ position: "absolute", left: 13, top: 14, color: "#85877c" }}
          />
          <input
            aria-label="Search vehicles"
            placeholder="Search make, model, zone, or city"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: "100%", paddingLeft: 39 }}
          />
        </label>

        <select
          aria-label="Filter by wheels"
          value={wheelType}
          onChange={(e) => setWheelType(e.target.value)}
        >
          <option>All vehicles</option>
          <option>2-Wheeler</option>
          <option>4-Wheeler</option>
        </select>

        <select
          aria-label="Filter by city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option>All locations</option>
          {["Chennai", "Bengaluru", "Kochi", "Coimbatore", "Hyderabad", "Mumbai"].map(
            (c) => (
              <option key={c}>{c}</option>
            )
          )}
        </select>

        <select
          aria-label="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>All types</option>
          {(
            [
              "Bike",
              "Scooter",
              "Hatchback",
              "Sedan",
              "SUV",
              "Electric",
            ] as VehicleCategory[]
          ).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          aria-label="Filter by rate"
          value={rateFilter}
          onChange={(e) => setRateFilter(e.target.value)}
        >
          <option>All rates</option>
          <option>Under ₹1,000/day</option>
        </select>

        <select
          aria-label="Sort vehicles"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option>Recommended</option>
          <option>Price: low to high</option>
          <option>Price: high to low</option>
          <option>Top Rated</option>
        </select>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div className="result-count" style={{ marginBottom: 0 }} aria-live="polite">
          <SlidersHorizontal size={12} style={{ display: "inline", marginRight: 7 }} />
          {loading ? "Finding available rides…" : `${list.length} vehicles matching your filters`}
        </div>
        <button
          type="button"
          onClick={fetchVehicles}
          style={{
            background: "none",
            border: 0,
            fontSize: 11,
            fontFamily: "var(--mono)",
            color: "#6b7280",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <RefreshCw size={11} /> Refresh inventory
        </button>
      </div>

      {loading ? (
        <div className="empty-state" role="status">
          <h3>Finding your next ride…</h3>
          <p className="muted">Checking the current marketplace inventory.</p>
        </div>
      ) : inventoryError && inventory.length === 0 ? (
        <div className="empty-state" role="alert">
          <h3>We couldn’t load the live marketplace.</h3>
          <p className="muted">
            Please try refreshing. Example vehicles are hidden until we can confirm there are no live listings.
          </p>
        </div>
      ) : list.length ? (
        <div className="vehicle-grid">
          {list.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      ) : inventory.length === 0 ? (
        <div className="empty-state">
          <h3>No live vehicles are listed right now.</h3>
          <p className="muted">
            Example vehicles below are for display only and cannot be booked.
          </p>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No vehicles matching your criteria.</h3>
          <p className="muted">
            Try adjusting your location, vehicle type or search keywords to view other available options.
          </p>
          <button
            className="button-primary"
            style={{ marginTop: 15 }}
            onClick={() => {
              setQuery("");
              setCity("All locations");
              setCategory("All types");
              setWheelType("All vehicles");
              setRateFilter("All rates");
            }}
          >
            Clear all filters
          </button>
        </div>
      )}
      {!loading && !inventoryError && inventory.length === 0 && <DemoVehicleShowcase />}

      {/* FOOTER NOTICE ON REGULATORY COMPLIANCE */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ShieldCheck size={20} className="text-[#657d24]" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Institutional &amp; Regulatory Standard</div>
            <p className="muted" style={{ margin: 0 }}>
              Documentation and safety details vary by listing. Review the information shown for each vehicle and confirm any required documents with the host before booking.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function RentPage() {
  return (
    <Suspense
      fallback={
        <main className="page-shell">
          <p className="page-intro">Loading verified vehicle fleet…</p>
        </main>
      }
    >
      <RentContent />
    </Suspense>
  );
}
