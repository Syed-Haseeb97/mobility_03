"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ShieldCheck, HardHat, RefreshCw } from "lucide-react";
import { seedVehicles, type Vehicle, type VehicleCategory } from "@/lib/data";
import { VehicleCard } from "@/components/vehicle-card";

function RentContent() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get("city") || "All locations";
  const initialWheels = searchParams.get("wheels") || "All vehicles";
  const initialCategory = searchParams.get("category") || "All types";
  const initialQuery = searchParams.get("search") || "";
  const startDate = searchParams.get("start") || "";
  const endDate = searchParams.get("end") || "";

  const [inventory, setInventory] = useState<Vehicle[]>(seedVehicles);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity === "" ? "All locations" : initialCity);
  const [category, setCategory] = useState(initialCategory);
  const [wheelType, setWheelType] = useState(initialWheels);
  const [rateFilter, setRateFilter] = useState("All rates");
  const [sort, setSort] = useState("Recommended");

  const fetchVehicles = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("start", startDate);
      if (endDate) params.set("end", endDate);
      const query = params.toString();
      const res = await fetch(query ? `/api/vehicles?${query}` : "/api/vehicles");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to load the current inventory.");
      }
      if (Array.isArray(data.vehicles)) {
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
          rating: v.rating || 0,
          trips: v.trips || 0,
          image: v.image,
          description: v.description,
          host: v.ownerName || "Local host",
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
      } else {
        throw new Error("The inventory response was not in the expected format.");
      }
    } catch (err) {
      console.error("Vehicle inventory could not be loaded:", err);
      setInventory([]);
      setLoadError("We couldn’t load the latest listings. Please try refreshing in a moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [startDate, endDate]);

  const list = useMemo(
    () =>
      inventory
        .filter((v) => {
          const textMatches = [v.name, v.make, v.city, v.campusZone || "", v.category, v.wheels || "", v.fuel || "", v.description || ""]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase());

          const cityMatches = city === "All locations" || v.city.toLowerCase() === city.toLowerCase();
          const catMatches = category === "All types" || v.category === category;
          const wheelMatches = wheelType === "All vehicles" || v.wheels === wheelType;
          const rateMatches =
            rateFilter === "All rates" ||
            (rateFilter === "Hourly flex" && (v.hourlyPrice || 0) > 0) ||
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
          <div className="eyebrow">Verified Marketplace / Live Inventory</div>
          <h1 className="page-heading">
            Find your kind
            <br />
            of drive.
          </h1>
        </div>
        <p className="page-intro">
          Explore inspected two-wheelers for quick campus errands and passenger vehicles for longer
          regional journeys. Filter by designated campus zone, pricing structure, and vehicle class.
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
          <option>Hourly flex</option>
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
        <div className="result-count" style={{ marginBottom: 0 }}>
          <SlidersHorizontal size={12} style={{ display: "inline", marginRight: 7 }} />
          {list.length} {startDate && endDate ? "available options" : "listed vehicles"}
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
        <div className="empty-state" role="status"><h3>Finding your options…</h3><p className="muted">Checking the latest listings{startDate && endDate ? " for your selected dates" : ""}.</p></div>
      ) : loadError ? (
        <div className="empty-state" role="alert"><h3>Inventory temporarily unavailable</h3><p className="muted">{loadError}</p><button className="button-primary" style={{ marginTop: 15 }} onClick={fetchVehicles}>Try again</button></div>
      ) : list.length ? (
        <div className="vehicle-grid">
          {list.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No vehicles matching your criteria.</h3>
          <p className="muted">
            Try adjusting your location, vehicle type or search keywords to view other available options. If you selected dates, check another range.
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

      {/* Listing transparency note */}
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
            <div style={{ fontWeight: 700, fontSize: 13 }}>Check the details before you ride</div>
            <p className="muted" style={{ margin: 0 }}>
              Verification labels reflect the information recorded on each listing. Confirm documents, insurance coverage, helmet arrangements, and rental terms with the host before booking.
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
