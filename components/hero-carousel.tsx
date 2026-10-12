"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { money } from "@/lib/data";

export interface CarouselSlide {
  id: string;
  vehicleId: string;
  name: string;
  make: string;
  category: string;
  city: string;
  price: number;
  headline: string;
  bg: string;
  panel: string;
  accent: string;
  cutout: string;
  description: string;
}

export const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: "slide-1",
    vehicleId: "v1",
    name: "Splendor Plus",
    make: "Hero",
    category: "2-Wheeler Commuter",
    city: "Chennai",
    price: 450,
    headline: "CAMPUS COMMUTE",
    bg: "#151e18",
    panel: "#1e2922",
    accent: "#c8e64c",
    cutout: "/vehicles/hero-splendor.png",
    description:
      "Reliable 97.2cc commuter motorcycle. Verified fuel economy, lightweight chassis, and accessible daily campus transit with ISI helmet included.",
  },
  {
    id: "slide-2",
    vehicleId: "v3",
    name: "Classic 350",
    make: "Royal Enfield",
    category: "2-Wheeler Cruiser",
    city: "Kochi",
    price: 1100,
    headline: "HIGHWAY TOURING",
    bg: "#1f181c",
    panel: "#2d2027",
    accent: "#c8e64c",
    cutout: "/vehicles/royal-enfield.png",
    description:
      "349cc single-cylinder cruiser with dual-channel ABS. Upright riding posture, authorized maintenance record, and dual helmets for inter-campus and suburban travel.",
  },
  {
    id: "slide-3",
    vehicleId: "v5",
    name: "Nano Twist",
    make: "Tata",
    category: "4-Wheeler City Car",
    city: "Coimbatore",
    price: 800,
    headline: "URBAN UTILITY",
    bg: "#1d1c16",
    panel: "#2b291e",
    accent: "#facc15",
    cutout: "/vehicles/tata-nano.png",
    description:
      "Compact 4-seater hatchback with power steering and air conditioning. Ideal for academic project group transport and campus perimeter runs.",
  },
  {
    id: "slide-4",
    vehicleId: "v6",
    name: "City i-VTEC",
    make: "Honda",
    category: "4-Wheeler Executive",
    city: "Bengaluru",
    price: 2200,
    headline: "EXECUTIVE CLASS",
    bg: "#161b22",
    panel: "#202732",
    accent: "#c8e64c",
    cutout: "/vehicles/honda-city.png",
    description:
      "1.5L i-VTEC executive sedan. Spacious rear-seat legroom, 6 airbags, and comprehensive commercial insurance for faculty and airport transit.",
  },
];

const GRAIN_DATA_URI =
  "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E";

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Preload all 4 car cutouts on mount
  useEffect(() => {
    CAROUSEL_SLIDES.forEach((item) => {
      const img = new window.Image();
      img.src = item.cutout;
    });

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 650ms lock navigation
  const navigate = useCallback(
    (direction: "next" | "prev") => {
      if (isAnimating) return;
      setIsAnimating(true);
      setActiveIndex((prev) =>
        direction === "next" ? (prev + 1) % 4 : (prev + 3) % 4
      );
      setTimeout(() => {
        setIsAnimating(false);
      }, 650);
    },
    [isAnimating]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        navigate("next");
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        navigate("prev");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        navigate("next");
      } else {
        navigate("prev");
      }
    }
    touchStartX.current = null;
  };

  const center = activeIndex;
  const left = (activeIndex + 3) % 4;
  const right = (activeIndex + 1) % 4;
  // back is default

  const getRole = (index: number): "center" | "left" | "right" | "back" => {
    if (index === center) return "center";
    if (index === left) return "left";
    if (index === right) return "right";
    return "back";
  };

  const getRoleStyle = (
    role: "center" | "left" | "right" | "back"
  ): React.CSSProperties => {
    const transition =
      "transform 650ms cubic-bezier(0.4,0,0.2,1), filter 650ms cubic-bezier(0.4,0,0.2,1), opacity 650ms cubic-bezier(0.4,0,0.2,1), left 650ms cubic-bezier(0.4,0,0.2,1), bottom 650ms cubic-bezier(0.4,0,0.2,1), height 650ms cubic-bezier(0.4,0,0.2,1)";

    if (role === "center") {
      return {
        position: "absolute",
        aspectRatio: "0.6 / 1",
        transform: `translateX(-50%) scale(${isMobile ? 1.25 : 1.68})`,
        filter: "blur(0px)",
        opacity: 1,
        zIndex: 20,
        left: "50%",
        height: isMobile ? "60%" : "92%",
        bottom: isMobile ? "22%" : 0,
        transition,
        willChange: "transform, filter, opacity, left, bottom, height",
      };
    }

    if (role === "left") {
      return {
        position: "absolute",
        aspectRatio: "0.6 / 1",
        transform: "translateX(-50%) scale(1)",
        filter: "blur(2px)",
        opacity: 0.85,
        zIndex: 10,
        left: isMobile ? "20%" : "30%",
        height: isMobile ? "16%" : "28%",
        bottom: isMobile ? "32%" : "12%",
        transition,
        willChange: "transform, filter, opacity, left, bottom, height",
      };
    }

    if (role === "right") {
      return {
        position: "absolute",
        aspectRatio: "0.6 / 1",
        transform: "translateX(-50%) scale(1)",
        filter: "blur(2px)",
        opacity: 0.85,
        zIndex: 10,
        left: isMobile ? "80%" : "70%",
        height: isMobile ? "16%" : "28%",
        bottom: isMobile ? "32%" : "12%",
        transition,
        willChange: "transform, filter, opacity, left, bottom, height",
      };
    }

    return {
      position: "absolute",
      aspectRatio: "0.6 / 1",
      transform: "translateX(-50%) scale(1)",
      filter: "blur(4px)",
      opacity: 0.8,
      zIndex: 5,
      left: "50%",
      height: isMobile ? "13%" : "22%",
      bottom: isMobile ? "32%" : "12%",
      transition,
      willChange: "transform, filter, opacity, left, bottom, height",
    };
  };

  const activeCar = CAROUSEL_SLIDES[activeIndex];

  return (
    <section
      className="relative w-full overflow-hidden select-none"
      style={{
        backgroundColor: activeCar.bg,
        transition: "background-color 650ms cubic-bezier(0.4, 0, 0.2, 1)",
        fontFamily: "'Inter', sans-serif",
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="MOBILITY 3D Automotive Carousel"
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "100vh", minHeight: "680px" }}
      >
        {/* 1. Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 50,
            backgroundImage: `url("${GRAIN_DATA_URI}")`,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
            opacity: 0.35,
          }}
        />

        {/* 2. Giant ghost text "OWN THE DRIVE" */}
        <div
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none text-white/90"
          style={{
            zIndex: 2,
            top: "16%",
            fontFamily: "'Anton', sans-serif",
            fontSize: "clamp(80px, 25vw, 360px)",
            fontWeight: 900,
            lineHeight: 1,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
            transition: "opacity 650ms ease",
          }}
        >
          {activeCar.headline}
        </div>

        {/* 3. Top-left brand label "MOBILITY" */}
        <div
          className="absolute top-6 left-4 sm:left-8 flex items-center gap-3 text-white"
          style={{
            zIndex: 60,
            opacity: 0.95,
          }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-[0.2em] font-mono"
            style={{ letterSpacing: "0.22em" }}
          >
            MOBILITY
          </span>
          <span className="text-[10px] text-white/50 font-mono">/</span>
          <span className="text-[10px] text-[#c8e64c] font-mono tracking-wider uppercase font-semibold">
            0{activeIndex + 1} · 04
          </span>
        </div>

        {/* 4. Carousel */}
        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          {CAROUSEL_SLIDES.map((slide, idx) => {
            const role = getRole(idx);
            const roleStyle = getRoleStyle(role);
            const isCenter = role === "center";

            return (
              <div
                key={slide.id}
                style={roleStyle}
                onClick={() => {
                  if (role === "left") navigate("prev");
                  if (role === "right") navigate("next");
                }}
                className={`flex flex-col items-center justify-end ${
                  role === "left" || role === "right"
                    ? "cursor-pointer hover:opacity-100"
                    : ""
                }`}
                title={
                  role === "left"
                    ? `Previous: ${slide.make} ${slide.name}`
                    : role === "right"
                    ? `Next: ${slide.make} ${slide.name}`
                    : `${slide.make} ${slide.name}`
                }
              >
                {/* Contact shadow beneath active center car */}
                {isCenter && (
                  <div
                    className="absolute w-[80%] h-12 bottom-4 pointer-events-none opacity-80"
                    style={{
                      background:
                        "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 45%, transparent 75%)",
                      filter: "blur(6px)",
                      transform: "translateY(10px)",
                    }}
                  />
                )}

                <div className="relative w-full h-full flex items-end justify-center">
                  <Image
                    src={slide.cutout}
                    alt={`${slide.make} ${slide.name}`}
                    draggable={false}
                    fill
                    sizes="(max-width: 640px) 90vw, 65vw"
                    priority={isCenter}
                    style={{
                      objectFit: "contain",
                      objectPosition: "bottom center",
                    }}
                    className="pointer-events-none select-none drop-shadow-[0_25px_35px_rgba(0,0,0,0.55)]"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 5. Bottom-left text + nav buttons */}
        <div
          className="absolute bottom-6 left-4 sm:bottom-16 sm:left-12 lg:left-20"
          style={{
            zIndex: 60,
            maxWidth: "380px",
          }}
        >
          {/* Eyebrow badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-white/10 text-[#c8e64c] text-[10px] font-mono uppercase tracking-wider">
              <MapPin size={10} /> {activeCar.city} · {activeCar.category}
            </span>
            <span className="text-white/80 font-mono text-xs font-semibold">
              {money(activeCar.price)} <small className="text-white/50 text-[10px]">/ day</small>
            </span>
          </div>

          <h2
            className="font-bold uppercase mb-1 sm:mb-2 text-lg sm:text-[24px] text-white tracking-wide"
            style={{
              opacity: 0.98,
              letterSpacing: "0.02em",
              lineHeight: 1.15,
            }}
          >
            {activeCar.make} {activeCar.name}
          </h2>

          <p
            className="text-xs uppercase tracking-widest text-[#c8e64c] font-semibold mb-2 sm:mb-3"
            style={{ letterSpacing: "0.1em" }}
          >
            FIND YOUR KIND OF DRIVE
          </p>

          <p
            className="hidden sm:block text-xs sm:text-sm text-white/85 mb-4 sm:mb-5 leading-[1.6]"
          >
            {activeCar.description}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("prev")}
              disabled={isAnimating}
              aria-label="Previous vehicle"
              className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-transparent border-2 border-white/80 text-white cursor-pointer transition-all duration-150 hover:scale-108 hover:bg-white/15 active:scale-95 disabled:opacity-70 disabled:cursor-default"
            >
              <ArrowLeft size={24} strokeWidth={2.25} />
            </button>

            <button
              type="button"
              onClick={() => navigate("next")}
              disabled={isAnimating}
              aria-label="Next vehicle"
              className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-transparent border-2 border-white/80 text-white cursor-pointer transition-all duration-150 hover:scale-108 hover:bg-white/15 active:scale-95 disabled:opacity-70 disabled:cursor-default"
            >
              <ArrowRight size={24} strokeWidth={2.25} />
            </button>
          </div>
        </div>

        {/* 6. Bottom-right link "EXPLORE THE FLEET" */}
        <Link
          href={`/rent/vehicle/${activeCar.vehicleId}`}
          className="absolute bottom-6 right-4 sm:bottom-16 sm:right-10 lg:right-16 flex items-center gap-1 sm:gap-2.5 text-white no-underline transition-all duration-200 cursor-pointer group hover:text-[#c8e64c]"
          style={{
            zIndex: 60,
            fontFamily: "'Anton', sans-serif",
            fontSize: "clamp(22px, 4.5vw, 56px)",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            textTransform: "uppercase",
          }}
          aria-label={`Explore ${activeCar.make} ${activeCar.name}`}
        >
          <span>EXPLORE THE FLEET</span>
          <ArrowUpRight
            className="w-5 h-5 sm:w-8 sm:h-8 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 text-[#c8e64c]"
            strokeWidth={2.5}
          />
        </Link>
      </div>
    </section>
  );
}
