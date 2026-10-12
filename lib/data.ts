export type VehicleCategory =
  | "Bike"
  | "Scooter"
  | "Hatchback"
  | "Sedan"
  | "SUV"
  | "Electric";

export type VehicleWheels = "2-Wheeler" | "4-Wheeler";

export type VehicleListingStatus =
  | "approved"
  | "pending_review"
  | "inactive"
  | "rejected"
  | "published"
  | "draft";

export type Vehicle = {
  id: string;
  name: string;
  make: string;
  category: VehicleCategory;
  wheels: VehicleWheels;
  city: string;
  campusZone?: string;
  pickupAddress?: string;
  price: number; // daily rate
  hourlyPrice?: number;
  deposit?: number;
  seats: number;
  transmission: "Automatic" | "Manual";
  fuel: string;
  year: number;
  rating: number;
  trips: number;
  image: string;
  description: string;
  host: string;
  ownerId?: string;
  registrationNumber?: string;
  insuranceValidTill?: string;
  rcVerified?: boolean;
  insuranceVerified?: boolean;
  helmetOption?: string;
  helmetCondition?: string;
  guidelines?: string;
  hostNotes?: string;
  status: VehicleListingStatus;
};

export type BookingStatus =
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "HANDOVER_PENDING"
  | "ACTIVE_TRIP"
  | "RETURNED"
  | "COMPLETED"
  | "CANCELLED"
  | "Confirmed · demo"
  | "Completed · demo";

export type Booking = {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleMake?: string;
  city: string;
  pickupZone?: string;
  pickupAddress?: string;
  registrationNumber?: string;
  start: string;
  end: string;
  total: number;
  rentalDays?: number;
  ratePerDay?: number;
  baseTotal?: number;
  helmetOptionSelected?: string;
  helmetFee?: number;
  damageWaiver?: number;
  platformFee?: number;
  taxes?: number;
  securityDeposit?: number;
  status: BookingStatus;
  guest: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  drivingLicense?: string;
  ownerId?: string;
  ownerName?: string;
  paymentStatus?: "PAID" | "REFUNDED" | "PENDING" | "REFUND_PENDING";
  paymentMethod?: "UPI" | "CARD" | "NETBANKING";
  paymentTxnId?: string;
  handover?: {
    handoverTime?: string;
    startingOdometer?: number;
    fuelBatteryLevel?: string;
    helmetsIssued?: number;
    licenseInspected?: boolean;
    handoverNotes?: string;
  };
  returnRecord?: {
    returnTime?: string;
    closingOdometer?: number;
    damageObserved?: string;
    depositReleased?: boolean;
    depositDeduction?: number;
    depositReleaseNotes?: string;
  };
  review?: {
    rating: number;
    comment: string;
    createdAt?: string;
  };
};

export const seedVehicles: Vehicle[] = [
  // --- 2-WHEELERS ---
  {
    id: "v1",
    name: "Splendor Plus",
    make: "Hero",
    category: "Bike",
    wheels: "2-Wheeler",
    city: "Chennai",
    campusZone: "North Campus Gate / Transit Hub",
    pickupAddress: "Kiosk #3, North Gate Commercial Complex, Near Main Entrance",
    price: 450,
    hourlyPrice: 65,
    deposit: 500,
    seats: 2,
    transmission: "Manual",
    fuel: "Petrol",
    year: 2023,
    rating: 4.95,
    trips: 84,
    image: "/vehicles/hero-splendor.png",
    description:
      "Reliable 97.2cc commuter motorcycle. Features reliable drum braking, smooth gear shifts, and exceptional fuel efficiency. Ideal for academic campus errands, local hostel transit, and city rail terminal connections.",
    host: "Ramesh Sundaram (Juniper Hire)",
    ownerId: "usr-host-1",
    registrationNumber: "TN 09 BX 4412",
    insuranceValidTill: "2027-03-31",
    rcVerified: false,
    insuranceVerified: false,
    helmetOption: "1 Helmet Included",
    helmetCondition: "ISI Certified Steelbird helmet with sanitized interior, visor intact",
    hostNotes: "Handover at North Gate kiosk. Valid original DL required.",
    guidelines: "Campus speed limit 25 km/h. Mandatory helmet wearing.",
    status: "approved",
  },
  {
    id: "v2",
    name: "Pulsar 150",
    make: "Bajaj",
    category: "Bike",
    wheels: "2-Wheeler",
    city: "Bengaluru",
    campusZone: "Student Quarter / Hostel Block D",
    pickupAddress: "Cornerstone Hub, Opposite Hostel Block D Parking Bay",
    price: 650,
    hourlyPrice: 90,
    deposit: 1000,
    seats: 2,
    transmission: "Manual",
    fuel: "Petrol",
    year: 2024,
    rating: 4.92,
    trips: 56,
    image: "/vehicles/bajaj-pulsar.png",
    description:
      "150cc DTS-i twin spark motorcycle with front disc brake and digital instrument cluster. Fully serviced with fresh engine oil and verified tire tread. Well-suited for longer inter-campus transit, research park visits, and city commutes.",
    host: "Karthik Venkatesh (Cornerstone)",
    ownerId: "usr-host-2",
    registrationNumber: "KA 04 EL 9120",
    insuranceValidTill: "2027-06-30",
    rcVerified: false,
    insuranceVerified: false,
    helmetOption: "1 Helmet Included",
    helmetCondition: "Studds Ninja ISI-certified full-face helmet provided",
    hostNotes: "Daily pickup 7:30 AM to 8:30 PM. Quick student ID check.",
    guidelines: "Strictly no stunt riding or reckless maneuvers.",
    status: "approved",
  },
  {
    id: "v3",
    name: "Classic 350",
    make: "Royal Enfield",
    category: "Bike",
    wheels: "2-Wheeler",
    city: "Kochi",
    campusZone: "West Campus Promenade",
    pickupAddress: "Cedar Lane Depot, West Campus Gate #2",
    price: 1100,
    hourlyPrice: 160,
    deposit: 2000,
    seats: 2,
    transmission: "Manual",
    fuel: "Petrol",
    year: 2023,
    rating: 4.98,
    trips: 62,
    image: "/vehicles/royal-enfield.png",
    description:
      "349cc J-Series touring motorcycle. Upright ergonomic riding posture, dual-channel ABS, and robust build. Maintained meticulously through authorized service centers for comfortable suburban trips and weekend research travel.",
    host: "Anand Nair (Cedar Lane)",
    ownerId: "usr-host-3",
    registrationNumber: "KL 07 CD 2309",
    insuranceValidTill: "2027-05-15",
    rcVerified: false,
    insuranceVerified: false,
    helmetOption: "2 Helmets Included",
    helmetCondition: "Two Royal Enfield ISI open-face helmets with visors",
    hostNotes: "Original DL inspected. Vehicle checklist signed before handover.",
    guidelines: "Follow all highway and campus speed regulations.",
    status: "approved",
  },
  {
    id: "v4",
    name: "450X Gen 3",
    make: "Ather",
    category: "Scooter",
    wheels: "2-Wheeler",
    city: "Coimbatore",
    campusZone: "Library Approach / Tech Park Terminal",
    pickupAddress: "CleanRide Charging Station, East Library Plaza",
    price: 550,
    hourlyPrice: 75,
    deposit: 800,
    seats: 2,
    transmission: "Automatic",
    fuel: "Electric",
    year: 2024,
    rating: 4.89,
    trips: 41,
    image: "/vehicles/ather-450x.png",
    description:
      "All-electric smart scooter equipped with 3.7 kWh battery pack, connected navigation, and regenerative braking. Quiet, zero-emission campus mobility with 105 km real-world range per charge. Provided with portable home/hostel charger cable.",
    host: "Pooja Sharma (CleanRide EV)",
    ownerId: "usr-host-4",
    registrationNumber: "TN 37 EV 1044",
    insuranceValidTill: "2027-08-20",
    rcVerified: false,
    insuranceVerified: false,
    helmetOption: "1 Helmet Included",
    helmetCondition: "Vega Crux ISI helmet with quick-release chin strap",
    hostNotes: "Issued at 100% state of charge. Free charging at East Library dock.",
    guidelines: "Return with at least 20% state of charge.",
    status: "approved",
  },

  // --- 4-WHEELERS ---
  {
    id: "v5",
    name: "Nano Twist",
    make: "Tata",
    category: "Hatchback",
    wheels: "4-Wheeler",
    city: "Coimbatore",
    campusZone: "Student Quarter / Hostel Area",
    pickupAddress: "Residential Staff Enclave, Bay 12",
    price: 800,
    hourlyPrice: 110,
    deposit: 1500,
    seats: 4,
    transmission: "Manual",
    fuel: "Petrol",
    year: 2022,
    rating: 4.86,
    trips: 37,
    image: "/vehicles/tata-nano.png",
    description:
      "Compact urban city car featuring power steering, air conditioning, and outstanding maneuverability. Perfect for student project team transportation, campus grocery supplies, and narrow campus-edge access roads.",
    host: "Pooja Sharma (CleanRide)",
    ownerId: "usr-host-4",
    registrationNumber: "TN 37 CB 5521",
    insuranceValidTill: "2027-01-20",
    rcVerified: false,
    insuranceVerified: false,
    helmetOption: "Not Applicable",
    hostNotes: "Clean sanitized interior with emergency toolkit in trunk.",
    guidelines: "Seatbelts mandatory for all 4 occupants.",
    status: "approved",
  },
  {
    id: "v6",
    name: "City i-VTEC",
    make: "Honda",
    category: "Sedan",
    wheels: "4-Wheeler",
    city: "Bengaluru",
    campusZone: "Central Administrative Ring",
    pickupAddress: "Administrative Gate Parking Lot, Slot A4",
    price: 2200,
    hourlyPrice: 280,
    deposit: 3000,
    seats: 5,
    transmission: "Manual",
    fuel: "Petrol",
    year: 2023,
    rating: 4.96,
    trips: 49,
    image: "/vehicles/honda-city.png",
    description:
      "1.5-litre 4-cylinder executive sedan with rear AC vents, touch infotainment, and large 506-litre trunk capacity. Excellent safety rating with 6 airbags and Vehicle Stability Assist. Ideal for airport runs, faculty transit, and official delegation travel.",
    host: "Karthik Venkatesh (Cornerstone)",
    ownerId: "usr-host-2",
    registrationNumber: "KA 04 MC 8830",
    insuranceValidTill: "2027-09-15",
    rcVerified: false,
    insuranceVerified: false,
    helmetOption: "Not Applicable",
    hostNotes: "Fastag enabled on windshield for express tolls.",
    guidelines: "Valid LMV driving license required. Commercial trip logging applies.",
    status: "approved",
  },
  {
    id: "v7",
    name: "Thar 4×4",
    make: "Mahindra",
    category: "SUV",
    wheels: "4-Wheeler",
    city: "Kochi",
    campusZone: "West Campus Promenade",
    pickupAddress: "Cedar Lane Vehicle Depot, West Ring Road",
    price: 3400,
    hourlyPrice: 420,
    deposit: 5000,
    seats: 4,
    transmission: "Manual",
    fuel: "Diesel",
    year: 2023,
    rating: 4.94,
    trips: 58,
    image: "/vehicles/mahindra-thar.png",
    description:
      "All-terrain 4WD vehicle with 226 mm ground clearance, roll cage structure, and diesel powertrain. Maintained for rugged topography and regional research expeditions.",
    host: "Anand Nair (Cedar Lane)",
    ownerId: "usr-host-3",
    registrationNumber: "KL 07 BK 7701",
    insuranceValidTill: "2027-07-31",
    rcVerified: false,
    insuranceVerified: false,
    helmetOption: "Not Applicable",
    hostNotes: "Inspection sheet and photo record completed at handover.",
    guidelines: "Zero alcohol policy strictly enforced.",
    status: "approved",
  },
  {
    id: "v8",
    name: "Creta SX",
    make: "Hyundai",
    category: "SUV",
    wheels: "4-Wheeler",
    city: "Chennai",
    campusZone: "North Campus Gate / Transit Hub",
    pickupAddress: "North Gate Commercial Complex, Suite 102",
    price: 2800,
    hourlyPrice: 350,
    deposit: 4000,
    seats: 5,
    transmission: "Automatic",
    fuel: "Petrol",
    year: 2024,
    rating: 4.91,
    trips: 52,
    image: "/vehicles/hyundai-creta.png",
    description:
      "Premium 5-seater mid-size SUV with automatic transmission, panoramic sunroof, wireless charging, and cruise control. Highly comfortable ride quality for campus visits and intercity travel.",
    host: "Ramesh Sundaram (Juniper Hire)",
    ownerId: "usr-host-1",
    registrationNumber: "TN 09 DX 1205",
    insuranceValidTill: "2027-08-30",
    rcVerified: false,
    insuranceVerified: false,
    helmetOption: "Not Applicable",
    hostNotes: "24/7 roadside assistance included. Clean interior maintained.",
    guidelines: "Valid LMV driving license required.",
    status: "approved",
  },
];

export const seedBookings: Booking[] = [
  {
    id: "MOB-24081",
    vehicleId: "v1",
    vehicleName: "Splendor Plus",
    vehicleMake: "Hero",
    city: "Chennai",
    pickupZone: "North Campus Gate / Transit Hub",
    pickupAddress: "Kiosk #3, North Gate Commercial Complex",
    registrationNumber: "TN 09 BX 4412",
    start: "2026-10-18",
    end: "2026-10-20",
    rentalDays: 2,
    ratePerDay: 450,
    baseTotal: 900,
    helmetOptionSelected: "1 Helmet Included (Free)",
    helmetFee: 0,
    damageWaiver: 50,
    platformFee: 90,
    taxes: 45,
    securityDeposit: 500,
    total: 1085,
    status: "CONFIRMED",
    guest: "Ananya Raman",
    customerName: "Ananya Raman",
    customerEmail: "ananya.r@iiitt.ac.in",
    customerPhone: "+91 98401 23456",
    drivingLicense: "TN-09-2023-0045192",
    ownerId: "usr-host-1",
    ownerName: "Ramesh Sundaram (Juniper Hire)",
    paymentStatus: "PAID",
    paymentMethod: "UPI",
    paymentTxnId: "UPI/261018894120/AXIS",
  },
  {
    id: "MOB-24065",
    vehicleId: "v6",
    vehicleName: "City i-VTEC",
    vehicleMake: "Honda",
    city: "Bengaluru",
    pickupZone: "Central Administrative Ring",
    pickupAddress: "Administrative Gate Parking Lot, Slot A4",
    registrationNumber: "KA 04 MC 8830",
    start: "2026-10-08",
    end: "2026-10-09",
    rentalDays: 1,
    ratePerDay: 2200,
    baseTotal: 2200,
    helmetOptionSelected: "Not Applicable",
    helmetFee: 0,
    damageWaiver: 150,
    platformFee: 220,
    taxes: 110,
    securityDeposit: 3000,
    total: 2680,
    status: "COMPLETED",
    guest: "Ananya Raman",
    customerName: "Ananya Raman",
    customerEmail: "ananya.r@iiitt.ac.in",
    customerPhone: "+91 98401 23456",
    drivingLicense: "TN-09-2023-0045192",
    ownerId: "usr-host-2",
    ownerName: "Karthik Venkatesh (Cornerstone)",
    paymentStatus: "PAID",
    paymentMethod: "CARD",
    paymentTxnId: "TXN_CC_998124065",
    handover: {
      handoverTime: "2026-10-08T09:00:00Z",
      startingOdometer: 24150,
      fuelBatteryLevel: "100%",
      licenseInspected: true,
      handoverNotes: "Clean vehicle handed over in slot A4.",
    },
    returnRecord: {
      returnTime: "2026-10-09T18:30:00Z",
      closingOdometer: 24295,
      damageObserved: "None, returned in pristine condition.",
      depositReleased: true,
      depositReleaseNotes: "Security deposit of ₹3,000 released in full to customer.",
    },
    review: {
      rating: 5,
      comment: "Smooth handover and great vehicle condition. Air conditioning worked flawlessly for campus guests.",
    },
  },
];

export const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export function daysBetween(start: string, end: string) {
  if (!start || !end) return 1;
  const a = new Date(start + "T12:00:00"),
    b = new Date(end + "T12:00:00");
  if (!Number.isFinite(a.getTime()) || !Number.isFinite(b.getTime()) || b < a)
    return 0;
  return Math.max(1, Math.ceil((b.getTime() - a.getTime()) / 86400000));
}
