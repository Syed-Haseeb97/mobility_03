"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, HardHat, ShieldCheck, UploadCloud, X, SlidersHorizontal } from "lucide-react";
import { type VehicleCategory, type VehicleWheels } from "@/lib/data";
import { useSession } from "@/components/session-provider";

async function prepareVehiclePhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1440 / bitmap.width, 1440 / bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Image processing is unavailable");
  }
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.78);
}

export default function AddVehicle() {
  const router = useRouter();
  const { currentUser } = useSession();

  const [step, setStep] = useState(0);
  const [showListingOptions, setShowListingOptions] = useState(false);
  const [showPickupAddress, setShowPickupAddress] = useState(false);
  const [showTransmission, setShowTransmission] = useState(false);
  const [showFuel, setShowFuel] = useState(false);
  const [showSeats, setShowSeats] = useState(false);

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
  const [price, setPrice] = useState("");
  const [hourlyPrice, setHourlyPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [seats, setSeats] = useState("2");
  const [transmission, setTransmission] = useState<"Automatic" | "Manual">("Manual");
  const [fuel, setFuel] = useState("Petrol");
  const [registrationNumber, setRegistrationNumber] = useState("TN 09 BX 4412");
  const [insuranceValidTill] = useState("2027-04-30");
  const [helmetIncluded, setHelmetIncluded] = useState(false);
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
      setHelmetIncluded(false);
      setSelectedImages([]);
      setPhotoNames([]);
    } else {
      setCategory("Hatchback");
      setSeats("5");
      setHelmetIncluded(false);
      setSelectedImages([]);
      setPhotoNames([]);
    }
  };

  async function publish() {
    if (!name.trim() || !make.trim()) {
      setError("Please specify both the vehicle make and model name.");
      return;
    }
    if (!price.trim() || Number(price) < 200 || !Number.isFinite(Number(price))) {
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
          hourlyPrice: hourlyPrice ? Number(hourlyPrice) : undefined,
          deposit: deposit ? Number(deposit) : undefined,
          seats: Number(seats),
          transmission,
          fuel,
          registrationNumber: registrationNumber.trim().toUpperCase(),
          insuranceValidTill,
          helmetOption: helmetIncluded ? "1 Helmet Included" : "",
          helmetIncluded,
          showPickupAddress,
          showTransmission,
          showFuel,
          showSeats,
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

  if (false) {
    return (
      <main className="page-shell">
        <div className="page-top">
          <div>
            <div className="eyebrow">Host Studio / Preview</div>
            <h1 className="page-heading">
              Partner onboarding
              <br />
              is in preview.
            </h1>
            <p className="page-intro">
              We are not accepting vehicle listings yet. Onboarding will open once secure partner
              accounts, persistent listing storage, and document review are ready.
            </p>
            <div className="hero-actions">
              <Link className="button-dark button-primary" href="/list-your-vehicle">
                <ArrowLeft size={15} /> Partner information
              </Link>
              <Link className="button-primary" href="/rent">
                Browse marketplace <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
        <div className="notice" role="status">
          No listing details or photos have been collected or saved.
        </div>
      </main>
    );
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

                <button type="button" onClick={() => setShowListingOptions(true)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: 12, border: "1px solid var(--line)", background: "#f8f9f3", textAlign: "left", cursor: "pointer", fontWeight: 700 }}>
                  <SlidersHorizontal size={16} /> Choose which details appear on your listing <span style={{ marginLeft: "auto", fontSize: 11, color: "#74786d" }}>Optional</span>
                </button>

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
                    <label style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, border: "1px solid var(--line)" }}>
                      <input type="checkbox" checked={helmetIncluded} onChange={(e) => setHelmetIncluded(e.target.checked)} />
                      <span>Helmet included</span>
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
                  <span style={{ fontWeight: 400, color: "#74786d" }}>Upload up to 5 real photos. Images are resized for faster previews and smaller uploads; the first photo becomes the main listing image.</span>
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
                        const encoded = await Promise.all(files.map(prepareVehiclePhoto));
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

          {showListingOptions && (
            <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowListingOptions(false); }} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(10,12,8,.58)", display: "grid", placeItems: "center", padding: 18 }}>
              <section role="dialog" aria-modal="true" aria-labelledby="listing-options-title" style={{ width: "min(100%, 460px)", background: "#fff", border: "1px solid var(--line)", padding: 24, boxShadow: "0 24px 80px #0004" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}>
                  <div><div className="eyebrow">Listing preferences</div><h3 id="listing-options-title" style={{ margin: "8px 0 4px", fontSize: 22 }}>What should renters see?</h3><p className="muted" style={{ fontSize: 12, margin: 0 }}>Tick only the details you want shown publicly.</p></div>
                  <button type="button" aria-label="Close listing preferences" onClick={() => setShowListingOptions(false)} style={{ border: 0, background: "transparent", cursor: "pointer" }}><X size={20} /></button>
                </div>
                <div style={{ display: "grid", gap: 14, margin: "22px 0" }}>
                  <label style={{ display: "flex", gap: 10, alignItems: "start", cursor: "pointer" }}><input type="checkbox" checked={showPickupAddress} onChange={(e) => setShowPickupAddress(e.target.checked)} style={{ marginTop: 3 }} /><span><strong>Pickup address</strong><span className="muted" style={{ display: "block", fontSize: 11, marginTop: 3 }}>Show the pickup location details</span></span></label>
                  <label style={{ display: "flex", gap: 10, alignItems: "start", cursor: "pointer" }}><input type="checkbox" checked={showTransmission} onChange={(e) => setShowTransmission(e.target.checked)} style={{ marginTop: 3 }} /><span><strong>Transmission</strong><span className="muted" style={{ display: "block", fontSize: 11, marginTop: 3 }}>Show Manual or Automatic</span></span></label>
                  <label style={{ display: "flex", gap: 10, alignItems: "start", cursor: "pointer" }}><input type="checkbox" checked={showFuel} onChange={(e) => setShowFuel(e.target.checked)} style={{ marginTop: 3 }} /><span><strong>Fuel / powertrain</strong><span className="muted" style={{ display: "block", fontSize: 11, marginTop: 3 }}>Show Petrol, Diesel, Electric, etc.</span></span></label>
                  <label style={{ display: "flex", gap: 10, alignItems: "start", cursor: "pointer" }}><input type="checkbox" checked={showSeats} onChange={(e) => setShowSeats(e.target.checked)} style={{ marginTop: 3 }} /><span><strong>Number of seats</strong><span className="muted" style={{ display: "block", fontSize: 11, marginTop: 3 }}>Show passenger capacity</span></span></label>
                </div>
                <button type="button" className="button-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setShowListingOptions(false)}>Save preferences <Check size={15} /></button>
              </section>
            </div>
          )}

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
                  if (step === 1 && (!price.trim() || Number(price) < 200)) {
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
                <span>{city || "City"} · {category}</span>
                <span style={{ color: "#546e14", fontWeight: 700 }}>New</span>
              </div>
              <h3 style={{ margin: "10px 0 6px" }}>
                {make || "Make"} {name || "Model Name"}
              </h3>
              <p className="muted" style={{ fontSize: 11, margin: "0 0 10px" }}>
                {[showPickupAddress ? [addressLine1, addressLine2, city, state, pinCode].filter(Boolean).join(", ") : "", showTransmission ? transmission : "", showFuel ? fuel : "", showSeats ? seats + " seats" : ""].filter(Boolean).join(" · ") || "Choose which details to show to renters."}
              </p>

              {wheels === "2-Wheeler" && helmetIncluded && (
                <div style={{ fontSize: 11, color: "#546e14", fontWeight: 600, marginBottom: 8 }}>
                  <HardHat size={12} style={{ display: "inline", marginRight: 4 }} /> Helmet included
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
                {price.trim() ? <>₹{Number(price).toLocaleString("en-IN")} <small>/ day</small></> : <span className="muted" style={{ fontSize: 12, fontWeight: 500 }}>Add your daily rate in Step 2</span>}
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
              <strong>Saved for review:</strong> Your listing details and uploaded photos are saved together. New listings remain pending review until approved.
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
