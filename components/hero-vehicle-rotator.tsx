"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const VEHICLES = [
  {
    name: "ATHER 450X",
    src: "/vehicles/ather-450x.png",
    alt: "Ather 450X electric scooter in a studio product view",
  },
  {
    name: "HERO SPLENDOR PLUS",
    src: "/vehicles/hero-splendor.png",
    alt: "Hero Splendor Plus commuter motorcycle in a studio product view",
  },
  {
    name: "BAJAJ PULSAR 150",
    src: "/vehicles/bajaj-pulsar.png",
    alt: "Bajaj Pulsar commuter motorcycle in a studio product view",
  },
] as const;

export function HeroVehicleRotator() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setActiveIndex((current) => (current + 1) % VEHICLES.length);
      }
    }, 4600);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <>
      <div className="hero-art-topline" aria-live="off" aria-atomic="true">
        <span>MOVE AT YOUR PACE</span>
        <span>
          0{activeIndex + 1} — 0{VEHICLES.length} · {VEHICLES[activeIndex].name}
        </span>
      </div>

      <div className="hero-vehicle-main" aria-label="Featured vehicles rotating automatically">
        {VEHICLES.map((vehicle, index) => {
          const isActive = index === activeIndex;
          return (
            <Image
              key={vehicle.src}
              src={vehicle.src}
              alt={isActive ? vehicle.alt : ""}
              aria-hidden={!isActive}
              fill
              priority={index === 0}
              sizes="(max-width: 700px) 92vw, 54vw"
              draggable={false}
              style={{
                objectFit: "contain",
                objectPosition: "center",
                opacity: isActive ? 1 : 0,
                transform: isActive ? "translateY(0) scale(1)" : "translateY(14px) scale(.96)",
                transition: "opacity 850ms ease, transform 850ms cubic-bezier(.2,.7,.2,1)",
                pointerEvents: "none",
              }}
            />
          );
        })}
      </div>

      <div
        className="hero-vehicle-dots"
        aria-label="Choose featured vehicle"
        style={{ position: "absolute", zIndex: 6, bottom: "13%", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 7 }}
      >
        {VEHICLES.map((vehicle, index) => (
          <button
            key={vehicle.src}
            type="button"
            aria-label={`Show ${vehicle.name}`}
            aria-pressed={index === activeIndex}
            onClick={() => setActiveIndex(index)}
            style={{
              width: index === activeIndex ? 22 : 6,
              height: 6,
              border: 0,
              borderRadius: 999,
              padding: 0,
              background: index === activeIndex ? "#c8ff3a" : "#aeb9a380",
              cursor: "pointer",
              transition: "width 250ms ease, background 250ms ease",
            }}
          />
        ))}
      </div>
    </>
  );
}
