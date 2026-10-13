"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, HardHat, ShieldCheck, UploadCloud, X } from "lucide-react";
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
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [pinCode, setPinCode] = useState("");

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
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [photoNames, setPhotoNames] = useState<string[]>([]);

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
      setSelectedImages([]);
      setPhotoNames([]);
    } else {
      setCategory("Hatchback");
      setSeats("5");
      setPrice("1800");
      setHourlyPrice("220");
      setDeposit("3000");
      setHelmetOption("Not Applicable");
      setSelectedImages([]);
      setPhotoNames([]);
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
    if (!addressLine1.trim() || !city.trim() || !state.trim() || !country.trim() || !pinCode.trim()) {
      setError("Please complete Address line 1, city, state, country and PIN code.");
      return;
    }
    if (selectedImages.length === 0) {
      setError("Please upload at least one real photo of your vehicle.");
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
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          pinCode: pinCode.trim(),
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim(),
          campusZone: "",
          pickupAddress: [addressLine1.trim(), addressLine2.trim()].filter(Boolean).join(", "),
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
          image: selectedImages[0],
          additionalPhotos: selectedImages.slice(1),
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

                <div className="eyebrow" style={{ marginTop: 10 }}>Vehicle address</div>
                <label>
                  Address line 1
                  <input className="form-input" autoComplete="address-line1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Street address, building, or pickup location" />
                </label>
                <label>
                  Address line 2 <span style={{ fontWeight: 400, color: "#74786d" }}>(optional)</span>
                  <input className="form-input" autoComplete="address-line2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Apartment, landmark, or extra directions" />
                </label>
                <div className="split-form">
                  <label>
                    City
                    <input className="form-input" autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
                  </label>
                  <label>
                    State
                    <input className="form-input" autoComplete="address-level1" value={state} onChange={(e) => setState(e.target.value)} placeholder="State" />
                  </label>
                </div>
                <div className="split-form">
                  <label>
                    Country
                    <input className="form-input" autoComplete="country-name" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" />
                  </label>
                  <label>
                    PIN code
                    <input className="form-input" autoComplete="postal-code" inputMode="numeric" value={pinCode} onChange={(e) => setPinCode(e.target.value.replace(/[^0-9-]/g, "").slice(0, 10))} placeholder="Postal / PIN code" />
                  </label>
                </div>
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
                  Vehicle photos
                  <span style={{ fontWeight: 400, color: "#74786d" }}>Upload up to 5 real photos. The first photo becomes the main listing image.</span>
                  <input
                    className="form-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    multiple
                    onChange={async (event) => {
                      const files = Array.from(event.target.files || []);
                      if (!files.length) return;
                      if (files.length > 5) {
                        setError("Please choose up to 5 photos.");
                        event.target.value = "";
                        return;
                      }
                      const tooLarge = files.find((file) => file.size > 5 * 1024 * 1024);
                      if (tooLarge) {
                        setError("Each photo must be 5 MB or smaller.");
                        event.target.value = "";
                        return;
                      }
                      try {
                        const encoded = await Promise.all(files.map((file) => new Promise<string>((resolve, reject) => {
                          const reader = new FileReader();
                          reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read image"));
                          reader.onerror = () => reject(new Error("Could not read image"));
                          reader.readAsDataURL(file);
                        })));
                        setSelectedImages(encoded);
                        setPhotoNames(files.map((file) => file.name));
                        setError("");
                      } catch {
                        setError("One or more photos could not be read. Please try again.");
                      }
                    }}
                  />
                </label>
                {selectedImages.length > 0 && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 12 }}>
                      <strong>{selectedImages.length} photo{selectedImages.length === 1 ? "" : "s"} selected</strong>
                      <button type="button" className="text-link" onClick={() => { setSelectedImages([]); setPhotoNames([]); }}>Remove all</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
                      {selectedImages.map((src, index) => (
                        <div key={photoNames[index] + index} style={{ position: "relative", height: 84, background: "#ecefe2", border: "1px solid var(--line)" }}>
                          <img src={src} alt={photoNames[index] || "Vehicle photo"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button type="button" aria-label={"Remove " + (photoNames[index] || "photo")} onClick={() => { setSelectedImages((current) => current.filter((_, i) => i !== index)); setPhotoNames((current) => current.filter((_, i) => i !== index)); }} style={{ position: "absolute", top: 3, right: 3, border: 0, borderRadius: "50%", width: 22, height: 22, display: "grid", placeItems: "center", background: "#171915", color: "#fff" }}><X size={12} /></button>
                          {index === 0 && <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 3, background: "#171915d9", color: "#d9fa58", fontSize: 9, textAlign: "center" }}>MAIN PHOTO</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
            <div style={{ minHeight: 180, background: "#ecefe2", position: "relative", display: "grid", gridTemplateColumns: selectedImages.length > 1 ? "repeat(2, minmax(0, 1fr))" : "1fr", gap: 2, padding: selectedImages.length ? 4 : 0 }}>
              {selectedImages.length ? selectedImages.map((src, index) => (
                <div key={photoNames[index] + index} style={{ height: selectedImages.length > 1 ? 112 : 180, minWidth: 0, background: "#f7f8f1", position: "relative" }}>
                  <img src={src} alt={photoNames[index] || "Uploaded vehicle photo"} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }} />
                  {index === 0 && <span style={{ position: "absolute", bottom: 5, left: 5, background: "#171915", color: "#d9fa58", padding: "3px 5px", fontSize: 8 }}>MAIN PHOTO</span>}
                </div>
              )) : (
                <div style={{ minHeight: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#74786d", padding: 18, textAlign: "center" }}>
                  <UploadCloud size={25} />
                  <strong style={{ fontSize: 12 }}>Your vehicle photos will appear here</strong>
                  <span style={{ fontSize: 10 }}>Upload real photos in the listing form. No stock images.</span>
                </div>
              )}
            </div>
            <div style={{ padding: 18 }}>
              <div className="vehicle-meta">
                <span>
                  {city || "City"} · {category}
                </span>
                <span>★ 5.00 · New</span>
              </div>
              <h3 style={{ margin: "10px 0 6px" }}>
                {make || "Make"} {name || "Model Name"}
              </h3>
              <p className="muted" style={{ fontSize: 11, margin: "0 0 10px" }}>
                {addressLine1 || "Pickup address"}{addressLine2 ? ", " + addressLine2 : ""}{city ? ", " + city : ""}{state ? ", " + state : ""}{pinCode ? " " + pinCode : ""} · {transmission} · {fuel}
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
