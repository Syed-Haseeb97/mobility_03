"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Navigation,
  CloudRain,
  Sun,
  Cloud,
  Wind,
  AlertTriangle,
  Info,
  CheckCircle2,
  Search,
  Route as RouteIcon,
  Compass,
} from "lucide-react";
import type { Vehicle } from "@/lib/data";
import { CAMPUS_ZONES, type CampusZone } from "@/lib/campus-zones";
import type { RouteCalculationResult } from "@/lib/server/routing";
import type { WeatherData } from "@/lib/server/weather";
import type { GeocodingResult } from "@/lib/server/geocoding";

// Dynamic import with SSR disabled for Leaflet map component
const CampusMap = dynamic(
  () => import("@/components/campus-map").then((mod) => mod.CampusMap),
  { ssr: false }
);

export interface JourneyDetails {
  pickup: {
    lat: number;
    lng: number;
    name: string;
    zoneName?: string;
  };
  dropoff: {
    lat: number;
    lng: number;
    name: string;
    zoneName?: string;
  };
  route: RouteCalculationResult | null;
  weather: WeatherData | null;
}

interface JourneyPlannerProps {
  vehicle: Vehicle;
  onJourneyUpdate?: (journey: JourneyDetails) => void;
}

export function JourneyPlanner({ vehicle, onJourneyUpdate }: JourneyPlannerProps) {
  // 1. Determine initial pickup coordinates from vehicle record or city campus zone
  const defaultZone = CAMPUS_ZONES.find(
    (z) =>
      z.city.toLowerCase() === (vehicle.city || "").toLowerCase() &&
      (z.name === vehicle.campusZone || z.id === (vehicle as any).campusZoneId)
  ) || CAMPUS_ZONES.find((z) => z.city.toLowerCase() === (vehicle.city || "").toLowerCase()) || CAMPUS_ZONES[0];

  const defaultPickupLat = vehicle.latitude || defaultZone.coordinates.lat;
  const defaultPickupLng = vehicle.longitude || defaultZone.coordinates.lng;

  // City-filtered campus zones for drop-off presets
  const availableCampusZones = CAMPUS_ZONES.filter(
    (z) => z.city.toLowerCase() === (vehicle.city || "").toLowerCase()
  );

  // Default drop-off to a secondary campus zone or same depot
  const secondaryZone =
    availableCampusZones.find((z) => z.coordinates.lat !== defaultPickupLat) ||
    availableCampusZones[0] ||
    defaultZone;

  type LocationPoint = {
    lat: number;
    lng: number;
    name: string;
    zoneName?: string;
  };

  const [pickup, setPickup] = useState<LocationPoint>({
    lat: defaultPickupLat,
    lng: defaultPickupLng,
    name: vehicle.pickupAddress || defaultZone.name,
    zoneName: vehicle.campusZone || defaultZone.name,
  });

  const [dropoff, setDropoff] = useState<LocationPoint>({
    lat: secondaryZone.coordinates.lat,
    lng: secondaryZone.coordinates.lng,
    name: secondaryZone.name,
    zoneName: secondaryZone.name,
  });

  const [route, setRoute] = useState<RouteCalculationResult | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Address search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Interactive map pin placement mode
  const [pinMode, setPinMode] = useState<"none" | "dropoff" | "pickup">("none");

  // Fetch Route from Server
  const fetchRoute = useCallback(async (originLat: number, originLng: number, destLat: number, destLng: number) => {
    setLoadingRoute(true);
    try {
      const is2Wheeler = vehicle.wheels === "2-Wheeler" || vehicle.category === "Bike" || vehicle.category === "Scooter";
      const wheelsParam = is2Wheeler ? "2-Wheeler" : "4-Wheeler";
      const res = await fetch(
        `/api/geo/route?originLat=${originLat}&originLng=${originLng}&destLat=${destLat}&destLng=${destLng}&wheels=${wheelsParam}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.route) {
          setRoute(data.route);
        }
      }
    } catch (err) {
      console.warn("JourneyPlanner route fetch failed:", err);
    } finally {
      setLoadingRoute(false);
    }
  }, [vehicle]);

  // Fetch Weather from Server (Open-Meteo)
  const fetchWeather = useCallback(async (lat: number, lng: number) => {
    setLoadingWeather(true);
    try {
      const is2Wheeler = vehicle.wheels === "2-Wheeler" || vehicle.category === "Bike" || vehicle.category === "Scooter";
      const wheelsParam = is2Wheeler ? "2-Wheeler" : "4-Wheeler";
      const res = await fetch(`/api/geo/weather?lat=${lat}&lng=${lng}&wheels=${wheelsParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.weather) {
          setWeather(data.weather);
        }
      }
    } catch (err) {
      console.warn("JourneyPlanner weather fetch failed:", err);
    } finally {
      setLoadingWeather(false);
    }
  }, [vehicle]);

  // Update Route and Weather when pickup/dropoff coordinates change
  useEffect(() => {
    fetchRoute(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
  }, [pickup.lat, pickup.lng, dropoff.lat, dropoff.lng, fetchRoute]);

  useEffect(() => {
    fetchWeather(pickup.lat, pickup.lng);
  }, [pickup.lat, pickup.lng, fetchWeather]);

  // Propagate journey details upward
  useEffect(() => {
    if (onJourneyUpdate) {
      onJourneyUpdate({
        pickup,
        dropoff,
        route,
        weather,
      });
    }
  }, [pickup, dropoff, route, weather, onJourneyUpdate]);

  // Handle Search Input with Debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geo/geocode?q=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(vehicle.city || "")}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
          setShowSearchResults(true);
        }
      } catch (err) {
        console.warn("Search geocode failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, vehicle.city]);

  // Handle Location Select from Map Click
  const handleMapLocationSelect = async (coords: { lat: number; lng: number }, mode: "pickup" | "dropoff") => {
    try {
      const res = await fetch(`/api/geo/reverse?lat=${coords.lat}&lng=${coords.lng}`);
      let displayName = `Pinned Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;
      let zoneName: string | undefined;

      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          displayName = data.result.shortName || data.result.displayName;
          if (data.result.nearestCampusZone) {
            zoneName = data.result.nearestCampusZone.name;
          }
        }
      }

      if (mode === "dropoff") {
        setDropoff({
          lat: coords.lat,
          lng: coords.lng,
          name: displayName,
          zoneName,
        });
      } else {
        setPickup({
          lat: coords.lat,
          lng: coords.lng,
          name: displayName,
          zoneName,
        });
      }
      setPinMode("none");
    } catch (err) {
      console.warn("Reverse geocode failed:", err);
    }
  };

  return (
    <section className="journey-planner-card" aria-label="Journey route and meteorological intelligence">
      <div className="journey-header">
        <div>
          <span className="eyebrow" style={{ color: "#7b912b" }}>
            <Compass size={13} /> GEOSPATIAL INTELLIGENCE & ROUTE SHEET
          </span>
          <h3 style={{ fontSize: 20, margin: "6px 0 0", letterSpacing: "-0.5px" }}>
            Trip Corridor & Transit Navigation
          </h3>
        </div>

        {route && (
          <div className="journey-stats-badge">
            <span>
              ROAD DISTANCE: <b>{route.formattedDistance}</b>
            </span>
            <span>·</span>
            <span>
              EST. TIME: <b>{route.formattedDuration}</b>
            </span>
          </div>
        )}
      </div>

      {/* Corridor Points Configuration */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 18,
        }}
      >
        {/* PICKUP POINT */}
        <div style={{ background: "#f8f9f4", padding: "14px 16px", border: "1px solid #e5e7dc", borderRadius: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--mono)", color: "#546e14", fontWeight: 700 }}>
            <MapPin size={13} /> PICK-UP LOCATION
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4, color: "#171915" }}>
            {pickup.name}
          </div>
          {pickup.zoneName && (
            <div style={{ fontSize: 11, color: "#74786d", marginTop: 2 }}>
              Zone: {pickup.zoneName}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <select
              style={{
                fontSize: 11,
                padding: "6px 8px",
                background: "#fff",
                border: "1px solid #d4d7c8",
                borderRadius: 2,
                width: "100%",
              }}
              value={pickup.name}
              onChange={(e) => {
                const selected = availableCampusZones.find((z) => z.name === e.target.value);
                if (selected) {
                  setPickup({
                    lat: selected.coordinates.lat,
                    lng: selected.coordinates.lng,
                    name: selected.name,
                    zoneName: selected.name,
                  });
                }
              }}
            >
              <option value={pickup.name}>Current: {pickup.name}</option>
              {availableCampusZones.map((z) => (
                <option key={z.id} value={z.name}>
                  {z.name} ({z.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* DROP-OFF DESTINATION */}
        <div style={{ background: "#f8f9f4", padding: "14px 16px", border: "1px solid #e5e7dc", borderRadius: 3 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--mono)", color: "#1d4ed8", fontWeight: 700 }}>
              <Navigation size={13} /> DROP-OFF DESTINATION
            </div>
            <button
              type="button"
              onClick={() => setPinMode(pinMode === "dropoff" ? "none" : "dropoff")}
              style={{
                fontSize: 10,
                fontFamily: "var(--mono)",
                background: pinMode === "dropoff" ? "#c8ff3a" : "transparent",
                color: pinMode === "dropoff" ? "#171915" : "#64748b",
                border: "1px solid #cbd5e1",
                padding: "3px 7px",
                borderRadius: 2,
                cursor: "pointer",
              }}
            >
              {pinMode === "dropoff" ? "Cancel Pinning" : "Pin on Map"}
            </button>
          </div>

          <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4, color: "#171915" }}>
            {dropoff.name}
          </div>
          {dropoff.zoneName && (
            <div style={{ fontSize: 11, color: "#74786d", marginTop: 2 }}>
              Zone: {dropoff.zoneName}
            </div>
          )}

          {/* Preset Zone Select or Address Search */}
          <div style={{ display: "grid", gap: 8, marginTop: 10, position: "relative" }}>
            <select
              style={{
                fontSize: 11,
                padding: "6px 8px",
                background: "#fff",
                border: "1px solid #d4d7c8",
                borderRadius: 2,
                width: "100%",
              }}
              value={dropoff.name}
              onChange={(e) => {
                const selected = availableCampusZones.find((z) => z.name === e.target.value);
                if (selected) {
                  setDropoff({
                    lat: selected.coordinates.lat,
                    lng: selected.coordinates.lng,
                    name: selected.name,
                    zoneName: selected.name,
                  });
                }
              }}
            >
              <option value="">Select Predefined Campus Zone…</option>
              {availableCampusZones.map((z) => (
                <option key={z.id} value={z.name}>
                  {z.name} ({z.code})
                </option>
              ))}
            </select>

            {/* Address Autocomplete Search Input */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#fff",
                  border: "1px solid #d4d7c8",
                  padding: "0 8px",
                  borderRadius: 2,
                }}
              >
                <Search size={12} color="#8a8e80" />
                <input
                  type="text"
                  placeholder="Or search address / landmark…"
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: 11,
                    padding: "6px 8px",
                    width: "100%",
                    background: "transparent",
                  }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowSearchResults(true);
                  }}
                />
              </div>

              {/* Autocomplete Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 2,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                    zIndex: 20,
                    maxHeight: 180,
                    overflowY: "auto",
                  }}
                >
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid #f1f5f9",
                        background: "none",
                        borderLeft: "none",
                        borderRight: "none",
                        borderTop: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setDropoff({
                          lat: item.lat,
                          lng: item.lng,
                          name: item.shortName,
                          zoneName: item.isCampusZone ? item.shortName : undefined,
                        });
                        setSearchQuery("");
                        setShowSearchResults(false);
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>
                        {item.shortName}
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {item.displayName}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive OpenStreetMap Viewer */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <CampusMap
          pickup={{ lat: pickup.lat, lng: pickup.lng, label: pickup.name }}
          dropoff={{ lat: dropoff.lat, lng: dropoff.lng, label: dropoff.name }}
          routeCoordinates={route?.primaryGeometry?.coordinates}
          campusZones={availableCampusZones.map((z) => ({
            id: z.id,
            lat: z.coordinates.lat,
            lng: z.coordinates.lng,
            title: z.name,
            subtitle: z.description,
            tag: z.code,
            type: "zone",
          }))}
          interactiveMode={pinMode}
          onLocationSelect={handleMapLocationSelect}
          height="340px"
        />
      </div>

      {/* Routing Source & Distance Sheet */}
      {route && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 11,
            color: "#6b7280",
            padding: "8px 12px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RouteIcon size={13} color="#546e14" />
            <span>
              Route calculated via: <b>{route.routes[0]?.name || "Optimal Corridor"}</b> ({route.source.toUpperCase()})
            </span>
          </div>
          <div style={{ fontStyle: "italic", fontSize: 10 }}>{route.attribution}</div>
        </div>
      )}

      {/* Weather Intelligence Card (Open-Meteo) */}
      {weather && (
        <div
          className={`weather-intelligence-card ${
            weather.advisoryType === "warning"
              ? "weather-warning"
              : weather.advisoryType === "caution"
              ? "weather-caution"
              : "weather-info"
          }`}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 24 }}>
              {weather.conditionCode >= 51 ? (
                <CloudRain size={26} color="#0284c7" />
              ) : weather.conditionCode >= 2 ? (
                <Cloud size={26} color="#64748b" />
              ) : (
                <Sun size={26} color="#eab308" />
              )}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <strong style={{ fontSize: 14 }}>
                  {weather.temperatureC}°C · {weather.conditionLabel}
                </strong>
                {weather.maxPrecipitationProbability > 0 && (
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 10,
                      padding: "2px 6px",
                      background: weather.rainRisk === "high" ? "#dc2626" : "#0284c7",
                      color: "#fff",
                      borderRadius: 2,
                    }}
                  >
                    {weather.maxPrecipitationProbability}% Rain Risk
                  </span>
                )}
              </div>
              <p style={{ margin: "3px 0 0", fontSize: 11, lineHeight: 1.5 }}>
                {weather.contextualAdvisory}
              </p>
            </div>
          </div>

          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <span style={{ fontSize: 9, fontFamily: "var(--mono)", opacity: 0.8, display: "block" }}>
              {weather.attribution}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
