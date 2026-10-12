"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, HardHat, ShieldCheck, MapPin, Sparkles } from "lucide-react";
import { type VehicleCategory, type VehicleWheels } from "@/lib/data";
import { useSession } from "@/components/session-provider";

export default function AddVehicle() {
  const router = useRouter();
  const { currentUser } = useSession();

  const [step, setStep] = useState(0);

  // Step 1: Core Details
  const [make, setMake] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [wheels, setWheels] = useState<VehicleWheels>("2-Wheeler");
  const [category, setCategory] = useState<VehicleCategory>("Bike");
  const [city, setCity] = useState("Chennai");
  const [campusZone, setCampusZone] = useState("North Campus Gate / Transit Hub");
  const [pickupAddress, setPickupAddress] = useState("Kiosk #3, North Gate Commercial Complex");

  // Step 2: Operational Pricing & Specs
  const [price, setPrice] = useState("450");
  const [hourlyPrice, setHourlyPrice] = useState("65");
  const [deposit, setDeposit] = useState("500");
  const [seats, setSeats] = useState("2");
  const [transmission, setTransmission] = useState<"Automatic" | "Manual">("Manual");
  const [fuel, setFuel] = useState("Petrol");
  const [registrationNumber, setRegistrationNumber] = useState("TN 09 BX 4412");
  const [insuranceValidTill] = useState("2027-04-30");
  const [helmetOption, setHelmetOption] = useState<
    "1 Helmet Included" | "2 Helmets Included" | "Available on Request (₹50)" | "Not Applicable"
  >("1 Helmet Included");
  const [helmetCondition, setHelmetCondition] = useState("ISI certified helmet with clean sanitized liner");

  // Step 3: Owner's Custom Written Content ("posted by the guy who posts on rent")
  const [description, setDescription] = useState(
    ""
  );
  const [hostNotes, setHostNotes] = useState(
    "Pickup from designated campus parking bay. Please bring original physical driving license for verification."
  );
  const [guidelines, setGuidelines] = useState(
    "Campus speed limit 25 km/h strictly enforced. Helmet mandatory at all times. Return with matching fuel level."
  );
  const [selectedImage, setSelectedImage] = useState("/vehicles/hero-splendor.png");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleWheelsChange = (w: VehicleWheels) => {
    setWheels(w);
    if (w === "2-Wheeler") {
      setCategory("Bike");
      setSeats("2");
      setPrice("450");
      setHourlyPrice("65");
      setDeposit("500");
      setHelmetOption("1 Helmet Included");
      setSelectedImage("/vehicles/hero-splendor.png");
    } else {
      setCategory("Hatchback");
      setSeats("5");
      setPrice("1800");
      setHourlyPrice("220");
      setDeposit("3000");
      setHelmetOption("Not Applicable");
      setSelectedImage("/vehicles/honda-city.png");
    }
  };

  async function publish() {
    if (!name.trim() || !make.trim()) {
      setError("Please specify both the vehicle make and model name.");
      return;
    }
    if (Number(price) < 200 || !Number.isFinite(Number(price))) {
      setError("Daily rental rate must be at least ₹200.");
      return;
    }
    if (!description.trim() || description.trim().length < 15) {
      setError("Please write a detailed description of your vehicle (minimum 15 characters).");
      return;
    }
    if (!registrationNumber.trim()) {
      setError("Vehicle registration plate number (RC) is required for verification.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: currentUser?.id || "usr-host-1",
          ownerName: currentUser?.businessName || currentUser?.name || "Verified Partner",
          name: name.trim(),
          make: make.trim(),
          year: Number(year),
          category,
          wheels,
          city,
          campusZone,
          pickupAddress,
          price: Number(price),
          hourlyPrice: Number(hourlyPrice),
          deposit: Number(deposit),
          seats: Number(seats),
          transmission,
          fuel,
          registrationNumber: registrationNumber.trim().toUpperCase(),
          insuranceValidTill,
          helmetOption,
          helmetCondition,
          image: selectedImage,
          description: description.trim(),
          hostNotes: hostNotes.trim(),
          guidelines: guidelines.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to publish vehicle listing.");
        setIsSubmitting(false);
        return;
      }

      router.push("/host/listings?published=1");
    } catch (err) {
      setError("Network error while submitting listing.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="page-top">
        <div>
          <div className="eyebrow">Host Studio / Vehicle Onboarding</div>
          <h1 className="page-heading">
            List a vehicle on
            <br />
            the campus exchange.
          </h1>
          <p className="page-intro">
            Provide authentic vehicle information, set your preferred hourly &amp; daily rates,
            and describe the machine in your own words.
          </p>
        </div>
      </div>

      {/* STEP PROGRESS INDICATOR */}
      <div className="steps">
        {[0, 1, 2].map((n) => (
          <div key={n} className={n <= step ? "step active" : "step"} />
        ))}
      </div>

      <div className="detail-layout">
        <section style={{ background: "#fff", border: "1px solid var(--line)", padding: 28 }}>
          <div className="eyebrow">
            Step {step + 1} of 3 —{" "}
            {["Identity & Vehicle Class", "Rates, Safety & Documents", "Your Custom Description & Guidelines"][step]}
          </div>

          <h2 style={{ fontSize: 26, letterSpacing: "-0.8px", margin: "10px 0 20px" }}>
            {
              [
                "Specify Vehicle & Location",
                "Pricing, Helmet & RC Details",
                "Write Your Custom Listing Description",
              ][step]
            }
          </h2>

          <div className="form-stack">
            {step === 0 && (
              <>
                <label>
                  Vehicle Type / Wheels
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    {(["2-Wheeler", "4-Wheeler"] as VehicleWheels[]).map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => handleWheelsChange(w)}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: wheels === w ? "#171915" : "#f5f5f0",
                          color: wheels === w ? "#c8ff3a" : "#444",
                          border: "1px solid var(--line)",
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </label>

                <div className="split-form">
                  <label>
                    Make / Manufacturer
                    <input
                      className="form-input"
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      placeholder="e.g. Hero, Bajaj, Ather, Honda, Tata"
                    />
                  </label>

                  <label>
                    Model Name
                    <input
                      className="form-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Splendor Plus, Pulsar 150, 450X, City"
                    />
                  </label>
                </div>

                <div className="split-form">
                  <label>
                    Body Category
                    <select
                      className="form-input"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as VehicleCategory)}
                    >
                      {wheels === "2-Wheeler" ? (
                        <>
                          <option>Bike</option>
                          <option>Scooter</option>
                          <option>Electric</option>
                        </>
                      ) : (
                        <>
                          <option>Hatchback</option>
                          <option>Sedan</option>
                          <option>SUV</option>
                          <option>Electric</option>
                        </>
                      )}
                    </select>
                  </label>

                  <label>
                    Model Year
                    <input
                      className="form-input"
                      type="number"
                      min="2015"
                      max="2027"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    />
                  </label>
                </div>

                <div className="split-form">
                  <label>
                    City
                    <select
                      className="form-input"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    >
                      {["Chennai", "Bengaluru", "Kochi", "Coimbatore", "Hyderabad", "Mumbai"].map(
                        (c) => (
                          <option key={c}>{c}</option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    Campus Zone
                    <select
                      className="form-input"
                      value={campusZone}
                      onChange={(e) => setCampusZone(e.target.value)}
                    >
                      <option>North Campus Gate / Transit Hub</option>
                      <option>Student Quarter / Hostel Block D</option>
                      <option>Library Approach / Tech Park Terminal</option>
                      <option>West Campus Promenade</option>
                      <option>Central Administrative Ring</option>
                    </select>
                  </label>
                </div>

                <label>
                  Specific Pickup Address / Handover Bay
                  <input
                    className="form-input"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="e.g. Kiosk #3, North Gate Commercial Complex"
                  />
                </label>
              </>
            )}

            {step === 1 && (
              <>
                <div className="split-form">
                  <label>
                    Daily Rental Rate (₹)
                    <input
                      className="form-input"
                      type="number"
                      min="200"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </label>

                  <label>
                    Hourly Flex Rate (₹)
                    <input
                      className="form-input"
                      type="number"
                      min="30"
                      value={hourlyPrice}
                      onChange={(e) => setHourlyPrice(e.target.value)}
                    />
                  </label>
                </div>

                <div className="split-form">
                  <label>
                    Refundable Security Deposit (₹)
                    <input
                      className="form-input"
                      type="number"
                      min="300"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                    />
                  </label>

                  <label>
                    Transmission
                    <select
                      className="form-input"
                      value={transmission}
                      onChange={(e) => setTransmission(e.target.value as any)}
                    >
                      <option>Manual</option>
                      <option>Automatic</option>
                    </select>
                  </label>
                </div>

                <div className="split-form">
                  <label>
                    Fuel / Powertrain
                    <select
                      className="form-input"
                      value={fuel}
                      onChange={(e) => setFuel(e.target.value)}
                    >
                      <option>Petrol</option>
                      <option>Electric</option>
                      <option>Diesel</option>
                      <option>Hybrid</option>
                    </select>
                  </label>

                  <label>
                    Seats
                    <input
                      className="form-input"
                      type="number"
                      min="1"
                      max="8"
                      value={seats}
                      onChange={(e) => setSeats(e.target.value)}
                    />
                  </label>
                </div>

                <div className="split-form">
                  <label>
                    Registration Plate Number (RC)
                    <input
                      className="form-input"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. TN 09 BX 4412"
                    />
                  </label>

                  {wheels === "2-Wheeler" ? (
                    <label>
                      Helmet Provision
                      <select
                        className="form-input"
                        value={helmetOption}
                        onChange={(e) => setHelmetOption(e.target.value as any)}
                      >
                        <option>1 Helmet Included</option>
                        <option>2 Helmets Included</option>
                        <option>Available on Request (₹50)</option>
                      </select>
                    </label>
                  ) : (
                    <label>
                      Insurance Policy Status
                      <input
                        className="form-input"
                        disabled
                        value="Commercial Comprehensive (Verified)"
                      />
                    </label>
                  )}
                </div>

                {wheels === "2-Wheeler" && (
                  <label>
                    Helmet Condition Note
                    <input
                      className="form-input"
                      value={helmetCondition}
                      onChange={(e) => setHelmetCondition(e.target.value)}
                      placeholder="e.g. ISI certified Steelbird helmet with clean sanitized interior"
                    />
                  </label>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <label>
                  Owner&apos;s Description{" "}
                  <span style={{ fontWeight: 400, color: "#74786d" }}>
                    (Describe your machine in your own words — its condition, ride feel, and utility)
                  </span>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Well-maintained daily commuter with reliable drum braking and fresh oil change. Kept under sheltered parking, ideal for hostel errands and town runs."
                  />
                </label>

                <label>
                  Host Handover Notes for Customer
                  <textarea
                    className="form-input"
                    rows={2}
                    value={hostNotes}
                    onChange={(e) => setHostNotes(e.target.value)}
                    placeholder="e.g. Handover at North Gate security point. Bring original physical driving license."
                  />
                </label>

                <label>
                  Usage Rules &amp; Return Guidelines
                  <textarea
                    className="form-input"
                    rows={2}
                    value={guidelines}
                    onChange={(e) => setGuidelines(e.target.value)}
                    placeholder="e.g. Adhere to campus 25 km/h limit. Helmet mandatory. Return with equal fuel."
                  />
                </label>

                <label>
                  Select Photographic Cutout Asset
                  <select
                    className="form-input"
                    value={selectedImage}
                    onChange={(e) => setSelectedImage(e.target.value)}
                  >
                    {wheels === "2-Wheeler" ? (
                      <>
                        <option value="/vehicles/hero-splendor.png">Hero Splendor Plus (Commuter)</option>
                        <option value="/vehicles/bajaj-pulsar.png">Bajaj Pulsar 150 (Sport Commuter)</option>
                        <option value="/vehicles/royal-enfield.png">Royal Enfield Classic 350 (Cruiser)</option>
                        <option value="/vehicles/ather-450x.png">Ather 450X (Electric Scooter)</option>
                      </>
                    ) : (
                      <>
                        <option value="/vehicles/tata-nano.png">Tata Nano Twist (Compact Car)</option>
                        <option value="/vehicles/honda-city.png">Honda City i-VTEC (Sedan)</option>
                        <option value="/vehicles/mahindra-thar.png">Mahindra Thar 4×4 (SUV)</option>
                        <option value="/vehicles/hyundai-creta.png">Hyundai Creta SX (Mid-Size SUV)</option>
                      </>
                    )}
                  </select>
                </label>
              </>
            )}
          </div>

          {error && (
            <div className="toast" style={{ background: "#7f1d1d" }} role="alert">
              {error}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              borderTop: "1px solid var(--line)",
              paddingTop: 20,
              marginTop: 18,
            }}
          >
            {step > 0 ? (
              <button
                className="text-link"
                type="button"
                onClick={() => {
                  setError("");
                  setStep(step - 1);
                }}
              >
                <ArrowLeft size={15} /> Back
              </button>
            ) : (
              <span />
            )}

            {step < 2 ? (
              <button
                className="button-primary"
                type="button"
                onClick={() => {
                  if (step === 0 && (!make.trim() || !name.trim())) {
                    setError("Please enter the vehicle make and model.");
                    return;
                  }
                  if (step === 1 && (!price || Number(price) < 200)) {
                    setError("Daily rate must be at least ₹200.");
                    return;
                  }
                  setError("");
                  setStep(step + 1);
                }}
              >
                Continue to Next Step <ArrowRight size={15} />
              </button>
            ) : (
              <button
                className="button-primary"
                type="button"
                disabled={isSubmitting}
                onClick={publish}
              >
                {isSubmitting ? "Persisting to Marketplace…" : "Publish Vehicle Listing"}
                <Check size={15} />
              </button>
            )}
          </div>
        </section>

        {/* RIGHT PREVIEW CARD SHOWING OWNER'S LIVE CONTENT */}
        <aside className="wizard-preview">
          <div className="eyebrow">Real Listing Preview</div>
          <div
            style={{
              marginTop: 16,
              background: "#ffffff",
              border: "1px solid var(--line)",
              overflow: "hidden",
            }}
          >
            <div style={{ height: 180, background: "#ecefe2", position: "relative" }}>
              <img
                src={selectedImage}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "contain", padding: 12 }}
              />
            </div>
            <div style={{ padding: 18 }}>
              <div className="vehicle-meta">
                <span>
                  {city} · {category}
                </span>
                <span>★ 5.00 · New</span>
              </div>
              <h3 style={{ margin: "10px 0 6px" }}>
                {make || "Make"} {name || "Model Name"}
              </h3>
              <p className="muted" style={{ fontSize: 11, margin: "0 0 10px" }}>
                Plate: {registrationNumber || "TN 09 XX 0000"} · {transmission} · {fuel}
              </p>

              {wheels === "2-Wheeler" && (
                <div style={{ fontSize: 11, color: "#546e14", fontWeight: 600, marginBottom: 8 }}>
                  <HardHat size={12} style={{ display: "inline", marginRight: 4 }} />
                  {helmetOption}
                </div>
              )}

              {description ? (
                <p
                  style={{
                    fontSize: 11,
                    lineHeight: 1.5,
                    color: "#47493f",
                    background: "#f9faf6",
                    padding: 8,
                    borderLeft: "3px solid #8fa82e",
                    marginBottom: 10,
                  }}
                >
                  &ldquo;{description}&rdquo;
                </p>
              ) : (
                <p className="muted" style={{ fontStyle: "italic", fontSize: 11, marginBottom: 10 }}>
                  Owner&apos;s custom description will appear here.
                </p>
              )}

              <div className="price">
                ₹{Number(price || 0).toLocaleString("en-IN")} <small>/ day</small>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              padding: 14,
              background: "#ffffff",
              border: "1px solid var(--line)",
              fontSize: 11,
              color: "#5b5f52",
              lineHeight: 1.6,
            }}
          >
            <ShieldCheck size={16} className="text-[#647c1f]" style={{ marginBottom: 4 }} />
            <div>
              <strong>Instant Database Persistence:</strong> Your listing is stored in the platform
              database and becomes immediately discoverable in the search catalog.
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
