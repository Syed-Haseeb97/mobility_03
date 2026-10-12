"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Gauge,
  Fuel,
  Info,
  CalendarDays,
  FileCheck2,
  HardHat,
  RotateCcw,
  ZoomIn,
  Sliders,
  Sparkles,
} from "lucide-react";
import { money } from "@/lib/data";

export type VehicleMode = "2-Wheeler" | "4-Wheeler";

interface FleetVehicle {
  id: string;
  name: string;
  brand: string;
  categoryTag: string;
  image: string;
  price: number;
  hourlyPrice: number;
  deposit: number;
  city: string;
  campusZone: string;
  seats: number;
  transmission: string;
  fuel: string;
  registrationNumber: string;
  insuranceValidTill: string;
  helmetOption: string;
  hostName: string;
  engineDisplacement: string;
  groundClearance: string;
  fuelEfficiency: string;
  verifiedBadge: string;
  description: string;
}

const FLEET_TWO_WHEELERS: FleetVehicle[] = [
  {
    id: "v1",
    name: "Splendor Plus",
    brand: "Hero",
    categoryTag: "Commuter Motorcycle",
    image: "/vehicles/hero-splendor.png",
    price: 450,
    hourlyPrice: 65,
    deposit: 500,
    city: "Chennai",
    campusZone: "North Campus Gate / Transit Hub",
    seats: 2,
    transmission: "4-Speed Manual",
    fuel: "Petrol (BS-VI)",
    registrationNumber: "TN 09 BX 4412",
    insuranceValidTill: "Valid till March 2027",
    helmetOption: "1 ISI Certified Helmet Included",
    hostName: "Ramesh Sundaram (Juniper Hire)",
    engineDisplacement: "97.2 cc Single Cylinder",
    groundClearance: "165 mm",
    fuelEfficiency: "65–70 km/l ARAI Tested",
    verifiedBadge: "Campus Verified Partner",
    description:
      "Reliable 97.2cc commuter motorcycle. Features reliable drum braking, smooth gear shifts, and exceptional fuel efficiency. Ideal for academic campus errands, local hostel transit, and city rail terminal connections.",
  },
  {
    id: "v2",
    name: "Pulsar 150",
    brand: "Bajaj",
    categoryTag: "Sports Commuter",
    image: "/vehicles/bajaj-pulsar.png",
    price: 650,
    hourlyPrice: 90,
    deposit: 1000,
    city: "Bengaluru",
    campusZone: "Student Quarter / Hostel Block D",
    seats: 2,
    transmission: "5-Speed Manual",
    fuel: "Petrol (DTS-i)",
    registrationNumber: "KA 04 EL 9120",
    insuranceValidTill: "Valid till June 2027",
    helmetOption: "1 Full-Face Helmet Included",
    hostName: "Karthik Venkatesh (Cornerstone)",
    engineDisplacement: "149.5 cc DTS-i Twin Spark",
    groundClearance: "165 mm",
    fuelEfficiency: "45–50 km/l Verified",
    verifiedBadge: "Commercial Fleet Partner",
    description:
      "150cc DTS-i twin spark motorcycle with front disc brake and digital instrument cluster. Fully serviced with fresh engine oil and verified tire tread. Well-suited for longer inter-campus transit, research park visits, and city commutes.",
  },
  {
    id: "v3",
    name: "Classic 350",
    brand: "Royal Enfield",
    categoryTag: "Highway Touring Class",
    image: "/vehicles/royal-enfield.png",
    price: 1100,
    hourlyPrice: 160,
    deposit: 2000,
    city: "Kochi",
    campusZone: "West Campus Promenade",
    seats: 2,
    transmission: "5-Speed Constant Mesh",
    fuel: "Petrol (J-Series)",
    registrationNumber: "KL 07 CD 2309",
    insuranceValidTill: "Valid till May 2027",
    helmetOption: "2 ISI Helmets Included",
    hostName: "Anand Nair (Cedar Lane)",
    engineDisplacement: "349 cc Air-Oil Cooled",
    groundClearance: "170 mm",
    fuelEfficiency: "35–37 km/l Verified",
    verifiedBadge: "Authorized Touring Fleet",
    description:
      "349cc J-Series touring motorcycle. Upright ergonomic riding posture, dual-channel ABS, and robust build. Maintained meticulously through authorized service centers for comfortable suburban trips and weekend research travel.",
  },
  {
    id: "v4",
    name: "450X Gen 3",
    brand: "Ather",
    categoryTag: "Smart Electric Scooter",
    image: "/vehicles/ather-450x.png",
    price: 550,
    hourlyPrice: 75,
    deposit: 800,
    city: "Coimbatore",
    campusZone: "Library Approach / Tech Park Terminal",
    seats: 2,
    transmission: "Automatic EV Drive",
    fuel: "Electric (3.7 kWh Pack)",
    registrationNumber: "TN 37 EV 1044",
    insuranceValidTill: "Valid till August 2027",
    helmetOption: "1 ISI Certified Helmet Included",
    hostName: "Pooja Sharma (CleanRide EV)",
    engineDisplacement: "6.2 kW PMS Motor",
    groundClearance: "160 mm",
    fuelEfficiency: "105 km Real Range / Charge",
    verifiedBadge: "Green Campus Initiative",
    description:
      "All-electric smart scooter equipped with 3.7 kWh battery pack, connected navigation, and regenerative braking. Quiet, zero-emission campus mobility with 105 km real-world range per charge. Provided with portable home/hostel charger cable.",
  },
];

const FLEET_FOUR_WHEELERS: FleetVehicle[] = [
  {
    id: "v5",
    name: "Nano Twist",
    brand: "Tata",
    categoryTag: "Compact Urban Car",
    image: "/vehicles/tata-nano.png",
    price: 800,
    hourlyPrice: 110,
    deposit: 1500,
    city: "Coimbatore",
    campusZone: "Student Quarter / Hostel Area",
    seats: 4,
    transmission: "4-Speed Manual",
    fuel: "Petrol (MPFI)",
    registrationNumber: "TN 37 CB 5521",
    insuranceValidTill: "Valid till Jan 2027",
    helmetOption: "Not Applicable",
    hostName: "Pooja Sharma (CleanRide)",
    engineDisplacement: "624 cc 2-Cylinder",
    groundClearance: "180 mm",
    fuelEfficiency: "21 km/l City Average",
    verifiedBadge: "Individual Verified Host",
    description:
      "Compact urban city car featuring power steering, air conditioning, and outstanding maneuverability. Perfect for student project team transportation, campus grocery supplies, and narrow campus-edge access roads.",
  },
  {
    id: "v6",
    name: "City i-VTEC",
    brand: "Honda",
    categoryTag: "Executive Sedan",
    image: "/vehicles/honda-city.png",
    price: 2200,
    hourlyPrice: 280,
    deposit: 3000,
    city: "Bengaluru",
    campusZone: "Central Administrative Ring",
    seats: 5,
    transmission: "6-Speed Manual",
    fuel: "Petrol (i-VTEC)",
    registrationNumber: "KA 04 MC 8830",
    insuranceValidTill: "Valid till Sept 2027",
    helmetOption: "Not Applicable",
    hostName: "Karthik Venkatesh (Cornerstone)",
    engineDisplacement: "1,498 cc 4-Cylinder DOHC",
    groundClearance: "165 mm",
    fuelEfficiency: "17.8 km/l Certified",
    verifiedBadge: "Commercial Fleet Partner",
    description:
      "1.5-litre 4-cylinder executive sedan with rear AC vents, touch infotainment, and large 506-litre trunk capacity. Excellent safety rating with 6 airbags and Vehicle Stability Assist. Ideal for airport runs, faculty transit, and official delegation travel.",
  },
  {
    id: "v7",
    name: "Thar 4×4",
    brand: "Mahindra",
    categoryTag: "All-Terrain SUV",
    image: "/vehicles/mahindra-thar.png",
    price: 3400,
    hourlyPrice: 420,
    deposit: 5000,
    city: "Kochi",
    campusZone: "West Campus Promenade",
    seats: 4,
    transmission: "6-Speed Manual 4WD",
    fuel: "mHawk 130 Diesel",
    registrationNumber: "KL 07 BK 7701",
    insuranceValidTill: "Valid till July 2027",
    helmetOption: "Not Applicable",
    hostName: "Anand Nair (Cedar Lane)",
    engineDisplacement: "2,184 cc Turbo Diesel",
    groundClearance: "226 mm",
    fuelEfficiency: "14.5 km/l Highway Tested",
    verifiedBadge: "Authorized Regional Fleet",
    description:
      "All-terrain 4WD vehicle with 226 mm ground clearance, roll cage structure, and diesel powertrain. Maintained for rugged topography and regional research expeditions.",
  },
  {
    id: "v8",
    name: "Creta SX",
    brand: "Hyundai",
    categoryTag: "Premium Mid-Size SUV",
    image: "/vehicles/hyundai-creta.png",
    price: 2800,
    hourlyPrice: 350,
    deposit: 4000,
    city: "Chennai",
    campusZone: "North Campus Gate / Transit Hub",
    seats: 5,
    transmission: "CVT Automatic",
    fuel: "1.5L MPi Petrol",
    registrationNumber: "TN 09 DX 1205",
    insuranceValidTill: "Valid till August 2027",
    helmetOption: "Not Applicable",
    hostName: "Ramesh Sundaram (Juniper Hire)",
    engineDisplacement: "1,497 cc 4-Cylinder",
    groundClearance: "190 mm",
    fuelEfficiency: "16.8 km/l ARAI Tested",
    verifiedBadge: "Campus Verified Partner",
    description:
      "Premium 5-seater mid-size SUV with automatic transmission, panoramic sunroof, wireless charging, and cruise control. Highly comfortable ride quality for campus visits and intercity travel.",
  },
];

type InspectionAngle = "studio" | "specs" | "compliance";

export function Interactive3DVehicle() {
  const [mode, setMode] = useState<VehicleMode>("2-Wheeler");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [inspectionAngle, setInspectionAngle] = useState<InspectionAngle>("studio");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const list = mode === "2-Wheeler" ? FLEET_TWO_WHEELERS : FLEET_FOUR_WHEELERS;
  const currentVehicle = list[selectedIdx] || list[0];

  // Mouse / Pointer 3D Parallax Movement
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Smooth tilt angles
    setTilt({
      x: x * 22, // rotateY up to 11 deg
      y: -y * 16, // rotateX up to 8 deg
    });
  };

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const resetPerspective = () => {
    setTilt({ x: 0, y: 0 });
    setZoomLevel(1);
    setInspectionAngle("studio");
  };

  return (
    <section className="relative w-full bg-[#13161a] text-[#f4f5f2] border-b border-[#2d3238] overflow-hidden select-none">
      {/* Background radial atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background:
            "radial-gradient(circle at 50% 25%, rgba(200, 255, 58, 0.12) 0%, transparent 65%)",
        }}
      />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-8 pt-9 pb-14 relative z-10">
        {/* TOP ROW: CATEGORY SELECTION & FORMAL SUBHEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#252a32]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#1e232b] border border-[#353d49] text-[#c8ff3a] text-xs font-mono tracking-wider uppercase mb-2">
              <ShieldCheck size={13} />
              Verified Fleet Directory · Regulatory &amp; Campus Standards
            </div>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white">
              Explore Vehicle Fleet &amp; Specifications
            </h1>
            <p className="text-xs sm:text-sm text-[#9aa0ac] mt-1.5 max-w-[620px]">
              Inspected two-wheelers and passenger vehicles with authenticated documentation,
              transparent rental pricing, and designated campus pickup points.
            </p>
          </div>

          {/* TWO-WHEELER VS FOUR-WHEELER SWITCHER */}
          <div className="inline-flex p-1 bg-[#1a1e26] border border-[#323a46] rounded-xl gap-1 self-start md:self-auto shadow-inner">
            <button
              type="button"
              onClick={() => {
                setMode("2-Wheeler");
                setSelectedIdx(0);
                resetPerspective();
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider uppercase transition-all cursor-pointer ${
                mode === "2-Wheeler"
                  ? "bg-[#c8ff3a] text-[#111317] shadow-lg shadow-[#c8ff3a]/20"
                  : "text-[#9ca3af] hover:text-white hover:bg-white/5"
              }`}
            >
              <span>Two-Wheelers</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                  mode === "2-Wheeler" ? "bg-black/15 text-black" : "bg-white/10"
                }`}
              >
                Scooters &amp; Bikes
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("4-Wheeler");
                setSelectedIdx(0);
                resetPerspective();
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider uppercase transition-all cursor-pointer ${
                mode === "4-Wheeler"
                  ? "bg-[#c8ff3a] text-[#111317] shadow-lg shadow-[#c8ff3a]/20"
                  : "text-[#9ca3af] hover:text-white hover:bg-white/5"
              }`}
            >
              <span>Four-Wheelers</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                  mode === "4-Wheeler" ? "bg-black/15 text-black" : "bg-white/10"
                }`}
              >
                Cars &amp; SUVs
              </span>
            </button>
          </div>
        </div>

        {/* HORIZONTAL VEHICLE SELECTOR TABS */}
        <div className="flex gap-2.5 sm:gap-3 overflow-x-auto py-4 scrollbar-none border-b border-[#21262f]">
          {list.map((veh, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={veh.id}
                type="button"
                onClick={() => {
                  setSelectedIdx(idx);
                  resetPerspective();
                }}
                className={`flex-shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#202631] border-[#c8ff3a] text-white shadow-md shadow-[#c8ff3a]/10"
                    : "bg-[#161a22] border-[#29323e] text-[#9ca3af] hover:border-[#455060] hover:text-white"
                }`}
              >
                <div className="w-10 h-7 relative flex-shrink-0">
                  <Image
                    src={veh.image}
                    alt={veh.name}
                    fill
                    sizes="40px"
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-semibold leading-tight text-white">
                    {veh.brand} {veh.name}
                  </div>
                  <div className="text-[10px] font-mono text-[#c8ff3a] mt-0.5">
                    {money(veh.price)} / day · {veh.city}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* MAIN STUDIO INSPECTOR GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 items-stretch">
          {/* 3D PERSPECTIVE INSPECTOR STAGE */}
          <div
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className="lg:col-span-8 bg-gradient-to-b from-[#171b23] to-[#0f1115] border border-[#2b3442] rounded-xl overflow-hidden relative min-h-[460px] sm:min-h-[500px] flex flex-col justify-between shadow-xl cursor-crosshair"
            style={{
              perspective: "1200px",
              perspectiveOrigin: "50% 50%",
            }}
          >
            {/* Top Status Bar: Official badges */}
            <div className="p-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
              <div className="bg-[#111419]/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#c8ff3a]" />
                <span className="text-[11px] font-mono font-medium tracking-wider text-white uppercase">
                  Studio Inspection Mode
                </span>
                <span className="text-[10px] text-white/50 font-mono">
                  · Hover cursor to pivot perspective
                </span>
              </div>

              <div className="bg-[#111419]/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <FileCheck2 size={12} className="text-[#c8ff3a]" />
                <span className="text-[10px] font-mono text-[#cbd5e1] font-semibold">
                  RC: {currentVehicle.registrationNumber}
                </span>
              </div>
            </div>

            {/* Background Geometric Grid Floor */}
            <div
              className="absolute inset-x-0 bottom-0 h-[210px] pointer-events-none overflow-hidden"
              style={{
                transform: `rotateX(68deg) translateZ(-30px) rotateY(${tilt.x * 0.25}deg)`,
                transformOrigin: "bottom center",
                backgroundImage: `
                  linear-gradient(to right, rgba(200, 255, 58, 0.12) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(200, 255, 58, 0.12) 1px, transparent 1px)
                `,
                backgroundSize: "32px 32px",
                maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 25%, transparent 75%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse at center, rgba(0,0,0,1) 25%, transparent 75%)",
              }}
            />

            {/* Ground Contact Shadow */}
            <div
              className="absolute left-1/2 bottom-12 -translate-x-1/2 w-[340px] sm:w-[480px] h-[100px] rounded-[50%] border border-[#c8ff3a]/25 pointer-events-none"
              style={{
                transform: `rotateX(72deg) rotateY(${tilt.x * 0.25}deg)`,
                boxShadow: "0 0 35px rgba(200, 255, 58, 0.15), inset 0 0 25px rgba(200, 255, 58, 0.1)",
              }}
            />

            {/* Real Vehicle Photographic Model */}
            <div
              className="relative w-full flex-1 flex items-center justify-center p-4 z-20"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Elliptical Ground Contact Shadow */}
              <div
                className="absolute bottom-10 w-[60%] max-w-[420px] h-10 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 45%, transparent 75%)",
                  filter: "blur(6px)",
                  transform: "translateY(16px) rotateX(70deg)",
                }}
              />

              <div
                className="relative w-[85%] max-w-[480px] sm:max-w-[540px] h-[230px] sm:h-[300px] transition-transform duration-100 ease-out select-none"
                style={{
                  transform: `
                    rotateY(${tilt.x}deg)
                    rotateX(${tilt.y}deg)
                    scale(${zoomLevel})
                    translateZ(30px)
                  `,
                  filter:
                    "drop-shadow(0 20px 30px rgba(0,0,0,0.75)) drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
                }}
              >
                <Image
                  src={currentVehicle.image}
                  alt={`${currentVehicle.brand} ${currentVehicle.name}`}
                  fill
                  sizes="(max-width: 640px) 90vw, 540px"
                  priority
                  style={{
                    objectFit: "contain",
                    objectPosition: "bottom center",
                  }}
                  className="pointer-events-none"
                />
              </div>

              {/* SPECIFICATION HUD OVERLAYS */}
              {inspectionAngle === "specs" && (
                <div className="absolute inset-x-6 top-16 z-30 pointer-events-none">
                  <div className="max-w-[340px] bg-[#10141a]/95 backdrop-blur-md border border-[#3b4758] p-3 rounded-lg text-xs space-y-1.5 shadow-2xl">
                    <div className="text-[10px] font-mono text-[#c8ff3a] uppercase font-bold tracking-wider">
                      Technical Dimension Sheet
                    </div>
                    <div className="flex justify-between text-white/90">
                      <span>Powertrain / Engine:</span>
                      <span className="font-mono">{currentVehicle.engineDisplacement}</span>
                    </div>
                    <div className="flex justify-between text-white/90">
                      <span>Ground Clearance:</span>
                      <span className="font-mono">{currentVehicle.groundClearance}</span>
                    </div>
                    <div className="flex justify-between text-white/90">
                      <span>Fuel Efficiency / Range:</span>
                      <span className="font-mono">{currentVehicle.fuelEfficiency}</span>
                    </div>
                  </div>
                </div>
              )}

              {inspectionAngle === "compliance" && (
                <div className="absolute inset-x-6 top-16 z-30 pointer-events-none">
                  <div className="max-w-[340px] bg-[#10141a]/95 backdrop-blur-md border border-[#3b4758] p-3 rounded-lg text-xs space-y-1.5 shadow-2xl">
                    <div className="text-[10px] font-mono text-[#c8ff3a] uppercase font-bold tracking-wider">
                      Compliance &amp; Safety Requirements
                    </div>
                    <div className="flex justify-between text-white/90">
                      <span>Helmet Provision:</span>
                      <span className="font-mono">{currentVehicle.helmetOption}</span>
                    </div>
                    <div className="flex justify-between text-white/90">
                      <span>Insurance Validity:</span>
                      <span className="font-mono">{currentVehicle.insuranceValidTill}</span>
                    </div>
                    <div className="flex justify-between text-white/90">
                      <span>Designated Pickup:</span>
                      <span className="font-mono">{currentVehicle.campusZone}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FORMAL INSPECTION CONTROLS DOCK */}
            <div className="z-20 p-3 sm:p-4 bg-[#14181f]/95 backdrop-blur-md border-t border-[#262f3c] flex flex-wrap items-center justify-between gap-2.5">
              <div className="text-[11px] font-mono text-white/70 flex items-center gap-1.5">
                <Sliders size={13} className="text-[#c8ff3a]" />
                <span>Inspection View:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectionAngle("studio")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                    inspectionAngle === "studio"
                      ? "bg-[#c8ff3a] text-black border-[#c8ff3a] font-bold"
                      : "bg-[#1c222c] text-white/80 border-[#323d4e] hover:border-[#c8ff3a]"
                  }`}
                >
                  Exterior Studio
                </button>

                <button
                  type="button"
                  onClick={() => setInspectionAngle("specs")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                    inspectionAngle === "specs"
                      ? "bg-[#c8ff3a] text-black border-[#c8ff3a] font-bold"
                      : "bg-[#1c222c] text-white/80 border-[#323d4e] hover:border-[#c8ff3a]"
                  }`}
                >
                  Technical Specs
                </button>

                <button
                  type="button"
                  onClick={() => setInspectionAngle("compliance")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                    inspectionAngle === "compliance"
                      ? "bg-[#c8ff3a] text-black border-[#c8ff3a] font-bold"
                      : "bg-[#1c222c] text-white/80 border-[#323d4e] hover:border-[#c8ff3a]"
                  }`}
                >
                  Safety &amp; Helmet
                </button>

                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => (z === 1 ? 1.25 : 1))}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-[#1c222c] text-white/80 border border-[#323d4e] hover:border-white cursor-pointer"
                  title="Toggle Inspection Zoom"
                >
                  <ZoomIn size={12} />
                  <span>{zoomLevel > 1 ? "1.25x" : "1.0x"}</span>
                </button>

                <button
                  type="button"
                  onClick={resetPerspective}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-[#1c222c] text-white/80 border border-[#323d4e] hover:border-white cursor-pointer"
                  title="Reset Angle"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: AUTHENTICATED PARTNER & BOOKING SPEC SHEET */}
          <div className="lg:col-span-4 bg-[#171b23] border border-[#2b3543] rounded-xl p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded bg-[#222934] text-[#c8ff3a] text-[10px] font-mono uppercase font-semibold">
                  {currentVehicle.categoryTag} · {currentVehicle.city}
                </span>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  Verified
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                {currentVehicle.brand} {currentVehicle.name}
              </h2>

              <p className="text-xs font-mono text-[#a5abb7] mt-1 flex items-center gap-1.5">
                <span>Offered by:</span>
                <strong className="text-white">{currentVehicle.hostName}</strong>
              </p>

              {/* Host's description (as posted by the owner!) */}
              <div className="mt-4 p-3.5 bg-[#12151b] border border-[#28313e] rounded-lg">
                <span className="text-[10px] font-mono uppercase text-[#c8ff3a] block mb-1.5 font-bold">
                  Owner Listing Description
                </span>
                <p className="text-xs text-[#cbd5e1] leading-relaxed">
                  {currentVehicle.description}
                </p>
              </div>

              {/* SPEC SHEET METRICS */}
              <div className="grid grid-cols-2 gap-2.5 mt-4">
                <div className="bg-[#1e242f] p-2.5 rounded-lg border border-white/5">
                  <div className="text-[10px] font-mono text-white/50 uppercase flex items-center gap-1">
                    <Users size={11} /> Seating
                  </div>
                  <div className="text-xs font-bold text-white mt-1">
                    {currentVehicle.seats} Persons
                  </div>
                </div>

                <div className="bg-[#1e242f] p-2.5 rounded-lg border border-white/5">
                  <div className="text-[10px] font-mono text-white/50 uppercase flex items-center gap-1">
                    <Gauge size={11} /> Gearbox
                  </div>
                  <div className="text-xs font-bold text-white mt-1 truncate">
                    {currentVehicle.transmission}
                  </div>
                </div>

                <div className="bg-[#1e242f] p-2.5 rounded-lg border border-white/5">
                  <div className="text-[10px] font-mono text-white/50 uppercase flex items-center gap-1">
                    <Fuel size={11} /> Powertrain
                  </div>
                  <div className="text-xs font-bold text-white mt-1 truncate">
                    {currentVehicle.fuel}
                  </div>
                </div>

                <div className="bg-[#1e242f] p-2.5 rounded-lg border border-white/5">
                  <div className="text-[10px] font-mono text-white/50 uppercase flex items-center gap-1">
                    <HardHat size={11} /> Helmet Rule
                  </div>
                  <div className="text-xs font-bold text-white mt-1 truncate">
                    {currentVehicle.helmetOption}
                  </div>
                </div>
              </div>

              {/* CAMPUS PICKUP ZONE */}
              <div className="mt-3.5 text-xs text-[#94a3b8] flex items-center gap-2">
                <Info size={13} className="text-[#c8ff3a] flex-shrink-0" />
                <span>Pickup: {currentVehicle.campusZone}</span>
              </div>
            </div>

            {/* PRICING & BOOKING ACTION */}
            <div className="pt-6 mt-6 border-t border-[#293240]">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <div className="text-[10px] font-mono text-white/50 uppercase">
                    Authoritative Rental Rate
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight">
                    {money(currentVehicle.price)}
                    <span className="text-xs font-normal text-white/60"> / 24-hr day</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-white/50 uppercase">Hourly Flex</div>
                  <div className="text-sm font-mono text-[#c8ff3a]">
                    ₹{currentVehicle.hourlyPrice} / hr
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/rent/vehicle/${currentVehicle.id}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#c8ff3a] hover:bg-[#d8ff5e] text-[#111317] font-bold text-xs py-3.5 px-4 rounded-lg transition-all cursor-pointer shadow-md"
                >
                  <span>Reserve Vehicle</span>
                  <ArrowUpRight size={15} />
                </Link>

                <Link
                  href="/guidelines"
                  className="flex items-center justify-center px-3.5 py-3.5 rounded-lg border border-[#3b4758] text-white/80 hover:text-white hover:border-white text-xs font-mono transition-all"
                  title="View campus rental guidelines"
                >
                  Rules
                </Link>
              </div>

              <p className="text-[10px] font-mono text-white/40 text-center mt-2.5">
                Deposit: {money(currentVehicle.deposit)} (Refundable upon vehicle return)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
