import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Fuel, Gauge, Users, HardHat, ShieldCheck, MapPin } from "lucide-react";
import type { Vehicle } from "@/lib/data";
import { money } from "@/lib/data";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const is2Wheeler = vehicle.wheels === "2-Wheeler" || vehicle.category === "Bike" || vehicle.category === "Scooter";

  return (
    <article className="vehicle-card">
      <Link href={"/rent/vehicle/" + vehicle.id} aria-label={"View " + vehicle.name}>
        <div className="vehicle-image-wrap">
          <Image
            className="vehicle-image"
            src={vehicle.image}
            alt={vehicle.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
          />
          <span className="vehicle-tag">
            {vehicle.wheels || (is2Wheeler ? "2-Wheeler" : "4-Wheeler")} · {vehicle.category}
          </span>
          {vehicle.rcVerified && vehicle.insuranceVerified && (
            <span
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "rgba(23, 25, 21, 0.88)",
                color: "#c8ff3a",
                backdropFilter: "blur(6px)",
                padding: "4px 8px",
                borderRadius: 2,
                fontSize: 9,
                fontFamily: "var(--mono)",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <ShieldCheck size={11} /> Verified
            </span>
          )}
        </div>
      </Link>

      <div className="vehicle-info">
        <div className="vehicle-meta">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
            <MapPin size={11} />
            {vehicle.campusZone ? vehicle.campusZone.split("/")[0].trim() : vehicle.city}
          </span>
          <span>★ {vehicle.rating.toFixed(2)} · {vehicle.trips} trips</span>
        </div>

        <h3 className="vehicle-title">
          <Link href={"/rent/vehicle/" + vehicle.id} style={{ color: "inherit" }}>
            {vehicle.make} {vehicle.name}
          </Link>
        </h3>

        <div className="vehicle-specs">
          <span>
            <Users size={13} /> {vehicle.seats} seats
          </span>
          <span>
            <Gauge size={13} /> {vehicle.transmission}
          </span>
          <span>
            <Fuel size={13} /> {vehicle.fuel}
          </span>
          {is2Wheeler && vehicle.helmetOption && (
            <span style={{ color: "#546e14", fontWeight: 600 }}>
              <HardHat size={13} /> {vehicle.helmetOption.includes("Included") ? "Helmet Included" : "Helmet on Request"}
            </span>
          )}
        </div>

        <div style={{ fontSize: 11, color: "#74786d", marginTop: 10, display: "flex", justifyContent: "space-between" }}>
          <span>Host: {vehicle.host.split("(")[0].trim()}</span>
        </div>

        <div className="vehicle-bottom">
          <div className="price">
            {money(vehicle.price)} <small>/ day</small>
          </div>
          <Link
            className="arrow-link"
            href={"/rent/vehicle/" + vehicle.id}
            aria-label={"Explore " + vehicle.name}
          >
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
}
