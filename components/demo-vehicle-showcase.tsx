import Image from "next/image";

const DEMO_VEHICLES = [
  {
    make: "Honda",
    name: "Activa 6G",
    category: "Scooter",
    image: "/vehicles/scooter.png",
  },
  {
    make: "Hero",
    name: "Splendor Plus",
    category: "Bike",
    image: "/vehicles/hero-splendor.png",
  },
  {
    make: "Bajaj",
    name: "Pulsar 150",
    category: "Bike",
    image: "/vehicles/bajaj-pulsar.png",
  },
  {
    make: "Royal Enfield",
    name: "Classic 350",
    category: "Bike",
    image: "/vehicles/royal-enfield.png",
  },
  {
    make: "Ather",
    name: "450X",
    category: "Scooter",
    image: "/vehicles/ather-450x.png",
  },
  {
    make: "Tata",
    name: "Nano",
    category: "Hatchback",
    image: "/vehicles/tata-nano.png",
  },
  {
    make: "Honda",
    name: "City",
    category: "Sedan",
    image: "/vehicles/honda-city.png",
  },
  {
    make: "Mahindra",
    name: "Thar",
    category: "SUV",
    image: "/vehicles/mahindra-thar.png",
  },
  {
    make: "Hyundai",
    name: "Creta",
    category: "SUV",
    image: "/vehicles/hyundai-creta.png",
  },
] as const;

export function DemoVehicleShowcase() {
  return (
    <div style={{ marginTop: 32 }}>
      <div className="section-head">
        <div>
          <div className="eyebrow">Illustrative examples</div>
          <h3 style={{ fontSize: 22, marginTop: 12 }}>Vehicles the marketplace may feature</h3>
          <p className="muted" style={{ maxWidth: 620 }}>
            These examples are for display only. They are not live listings, have no current price
            or availability, and cannot be booked.
          </p>
        </div>
      </div>
      <div className="vehicle-grid">
        {DEMO_VEHICLES.map((vehicle) => (
          <article
            className="vehicle-card"
            key={vehicle.image}
            aria-label={`Example only, not available to book: ${vehicle.make} ${vehicle.name}`}
          >
            <div className="vehicle-image-wrap">
              <Image
                className="vehicle-image"
                src={vehicle.image}
                alt={`Illustrative ${vehicle.make} ${vehicle.name}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
              />
              <span className="vehicle-tag">Example · Not bookable</span>
            </div>
            <div className="vehicle-info">
              <div className="vehicle-meta">
                <span>{vehicle.category}</span>
                <strong style={{ color: "#8a4b12" }}>Sample</strong>
              </div>
              <h4 className="vehicle-title" style={{ marginBottom: 8 }}>
                {vehicle.make} {vehicle.name}
              </h4>
              <p className="muted" style={{ margin: 0 }}>
                Illustrative vehicle only — not a live listing.
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
