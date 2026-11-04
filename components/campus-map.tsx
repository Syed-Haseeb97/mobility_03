"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Polyline as LeafletPolyline, LayerGroup } from "leaflet";

export interface MapMarkerItem {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  tag?: string;
  price?: number;
  type?: "vehicle" | "pickup" | "dropoff" | "zone";
}

export interface CampusMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  pickup?: { lat: number; lng: number; label?: string };
  dropoff?: { lat: number; lng: number; label?: string };
  routeCoordinates?: [number, number][]; // GeoJSON [lng, lat] pairs
  vehicles?: MapMarkerItem[];
  campusZones?: MapMarkerItem[];
  interactiveMode?: "pickup" | "dropoff" | "none";
  onLocationSelect?: (coords: { lat: number; lng: number }, mode: "pickup" | "dropoff") => void;
  height?: string | number;
  className?: string;
}

// Configurable Map Tile Providers with CARTO Positron as default aesthetic
const DEFAULT_TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ||
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

const DEFAULT_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>';

const FALLBACK_OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export function CampusMap({
  center = { lat: 12.9915, lng: 80.2337 }, // Default: Chennai Campus Hub
  zoom = 14,
  pickup,
  dropoff,
  routeCoordinates,
  vehicles = [],
  campusZones = [],
  interactiveMode = "none",
  onLocationSelect,
  height = "320px",
  className = "",
}: CampusMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersGroupRef = useRef<LayerGroup | null>(null);
  const routeLineRef = useRef<LeafletPolyline | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current || mapInstanceRef.current) return;

      const initialCenter: [number, number] = pickup
        ? [pickup.lat, pickup.lng]
        : [center.lat, center.lng];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      // Primary Tile Layer: CARTO Positron (clean, neutral aesthetic)
      const primaryTileLayer = L.tileLayer(DEFAULT_TILE_URL, {
        maxZoom: 20,
        subdomains: "abcd",
        attribution: DEFAULT_ATTRIBUTION,
      });

      // Graceful error fallback to OpenStreetMap standard tiles if CARTO tiles fail
      let hasFallenBack = false;
      primaryTileLayer.on("tileerror", () => {
        if (!hasFallenBack && isMounted) {
          hasFallenBack = true;
          console.warn("CARTO tile error detected, falling back to OpenStreetMap standard tiles.");
          primaryTileLayer.remove();
          L.tileLayer(FALLBACK_OSM_TILE_URL, {
            maxZoom: 19,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
          }).addTo(map);
        }
      });

      primaryTileLayer.addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Handle map clicks in interactive mode
      map.on("click", (e) => {
        if (interactiveMode !== "none" && onLocationSelect) {
          onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng }, interactiveMode);
        }
      });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient]);

  // Update markers, routes, and bounds whenever props change
  useEffect(() => {
    if (!mapInstanceRef.current || !isClient) return;

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;
      const group = markersGroupRef.current;
      if (!map || !group) return;

      group.clearLayers();

      if (routeLineRef.current) {
        routeLineRef.current.remove();
        routeLineRef.current = null;
      }

      const allLatLngs: [number, number][] = [];

      // 1. Render Pickup Marker
      if (pickup && typeof pickup.lat === "number" && typeof pickup.lng === "number") {
        allLatLngs.push([pickup.lat, pickup.lng]);
        const pickupIcon = L.divIcon({
          className: "custom-map-pin pin-pickup",
          html: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -30],
        });

        const marker = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(group);
        marker.bindPopup(`
          <div style="font-family: inherit;">
            <div style="font-size: 10px; color: #a4c43b; text-transform: uppercase; font-weight: 700;">Pick-Up Point</div>
            <div style="font-weight: 700; margin-top: 2px;">${pickup.label || "Campus Pickup Bay"}</div>
            <div style="font-size: 10px; color: #8a8d80; margin-top: 4px;">Lat: ${pickup.lat.toFixed(4)}, Lng: ${pickup.lng.toFixed(4)}</div>
          </div>
        `);
      }

      // 2. Render Drop-off Marker
      if (dropoff && typeof dropoff.lat === "number" && typeof dropoff.lng === "number") {
        allLatLngs.push([dropoff.lat, dropoff.lng]);
        const dropoffIcon = L.divIcon({
          className: "custom-map-pin pin-dropoff",
          html: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 19 21 12 17 5 21 12 2"/></svg>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -30],
        });

        const marker = L.marker([dropoff.lat, dropoff.lng], { icon: dropoffIcon }).addTo(group);
        marker.bindPopup(`
          <div style="font-family: inherit;">
            <div style="font-size: 10px; color: #60a5fa; text-transform: uppercase; font-weight: 700;">Drop-Off Destination</div>
            <div style="font-weight: 700; margin-top: 2px;">${dropoff.label || "Return Station"}</div>
            <div style="font-size: 10px; color: #8a8d80; margin-top: 4px;">Lat: ${dropoff.lat.toFixed(4)}, Lng: ${dropoff.lng.toFixed(4)}</div>
          </div>
        `);
      }

      // 3. Render Route Polyline (GeoJSON [lng, lat] converted to Leaflet [lat, lng])
      if (routeCoordinates && routeCoordinates.length > 1) {
        const polylinePoints: [number, number][] = routeCoordinates.map(([lng, lat]) => [lat, lng]);
        polylinePoints.forEach((pt) => allLatLngs.push(pt));

        const polyline = L.polyline(polylinePoints, {
          color: "#c8ff3a",
          weight: 5,
          opacity: 0.9,
          lineJoin: "round",
          lineCap: "round",
        }).addTo(map);

        routeLineRef.current = polyline;
      }

      // 4. Render Campus Zones
      campusZones.forEach((zone) => {
        allLatLngs.push([zone.lat, zone.lng]);
        const zoneIcon = L.divIcon({
          className: "custom-map-pin pin-zone",
          html: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
          popupAnchor: [0, -15],
        });

        const marker = L.marker([zone.lat, zone.lng], { icon: zoneIcon }).addTo(group);
        marker.bindPopup(`
          <div style="font-family: inherit;">
            <div style="font-size: 9px; color: #d9fa58; text-transform: uppercase; font-weight: 700;">${zone.tag || "Campus Zone"}</div>
            <div style="font-weight: 700; margin-top: 2px;">${zone.title}</div>
            ${zone.subtitle ? `<div style="font-size: 11px; color: #a6aa9c; margin-top: 4px;">${zone.subtitle}</div>` : ""}
          </div>
        `);
      });

      // 5. Render Vehicles
      vehicles.forEach((v) => {
        allLatLngs.push([v.lat, v.lng]);
        const vehicleIcon = L.divIcon({
          className: "custom-map-pin pin-vehicle",
          html: `<span style="font-size: 10px; font-weight: 800;">₹</span>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -16],
        });

        const marker = L.marker([v.lat, v.lng], { icon: vehicleIcon }).addTo(group);
        marker.bindPopup(`
          <div style="font-family: inherit; min-width: 140px;">
            <div style="font-size: 9px; color: #a4c43b; text-transform: uppercase; font-weight: 700;">${v.tag || "Available"}</div>
            <div style="font-weight: 700; margin-top: 2px;">${v.title}</div>
            <div style="font-size: 11px; color: #cfd4c5; margin-top: 2px;">${v.subtitle || ""}</div>
            ${v.price ? `<div style="font-size: 12px; font-weight: 800; color: #c8ff3a; margin-top: 6px;">₹${v.price}/day</div>` : ""}
            <div style="margin-top: 8px;">
              <a href="/rent/vehicle/${v.id}" style="color: #c8ff3a; text-decoration: underline; font-size: 11px; font-weight: 700;">View Vehicle Sheet &rarr;</a>
            </div>
          </div>
        `);
      });

      // Fit bounds nicely if we have 2 or more coordinates
      if (allLatLngs.length > 1) {
        const bounds = L.latLngBounds(allLatLngs);
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 16 });
      } else if (allLatLngs.length === 1) {
        map.setView(allLatLngs[0], 15);
      }
    });
  }, [pickup, dropoff, routeCoordinates, vehicles, campusZones, isClient]);

  if (!isClient) {
    return (
      <div
        className={`campus-map-container ${className}`}
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#777c6e",
          fontSize: 12,
        }}
      >
        <span>Loading CARTO Positron Campus View…</span>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height }}>
      <div ref={mapContainerRef} className={`campus-map-container ${className}`} style={{ height: "100%" }} />
      {interactiveMode !== "none" && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 1000,
            background: "rgba(23, 25, 21, 0.92)",
            color: "#f5f5ed",
            padding: "6px 12px",
            borderRadius: 3,
            fontSize: 11,
            fontFamily: "var(--mono)",
            border: "1px solid #3d462c",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ color: "#c8ff3a" }}>●</span>
          Tap anywhere on map to set {interactiveMode === "pickup" ? "Pick-Up" : "Drop-Off"} pin
        </div>
      )}
    </div>
  );
}
