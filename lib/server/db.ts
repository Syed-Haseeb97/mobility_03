import fs from "fs";
import path from "path";

export type UserRole = "customer" | "owner" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  kycStatus: "verified" | "pending" | "unverified";
  kycDocType?: string;
  drivingLicense?: string;
  businessName?: string;
  campusAffiliation?: string;
  bankUpi?: string;
  rating?: number;
}

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
  | "rejected";

export interface VehicleRecord {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerType: "individual" | "commercial_rental";
  name: string;
  make: string;
  year: number;
  category: VehicleCategory;
  wheels: VehicleWheels;
  city: string;
  campusZone: string;
  pickupAddress: string;
  price: number; // daily rate in INR
  hourlyPrice: number; // hourly rate in INR
  deposit: number; // refundable deposit in INR
  seats: number;
  transmission: "Automatic" | "Manual";
  fuel: string;
  registrationNumber: string;
  insuranceValidTill: string;
  rcVerified: boolean;
  insuranceVerified: boolean;
  helmetOption:
    | "1 Helmet Included"
    | "2 Helmets Included"
    | "Available on Request (₹50)"
    | "Not Applicable";
  helmetCondition?: string;
  rating: number;
  trips: number;
  image: string;
  additionalPhotos?: string[];
  description: string;
  hostNotes?: string;
  guidelines?: string;
  status: VehicleListingStatus;
  rejectionReason?: string;
  createdAt: string;
}

export type BookingStatus =
  | "CONFIRMED"
  | "HANDOVER_PENDING"
  | "ACTIVE_TRIP"
  | "RETURNED"
  | "COMPLETED"
  | "CANCELLED";

export interface HandoverRecord {
  handoverTime?: string;
  startingOdometer?: number;
  fuelBatteryLevel?: string;
  helmetsIssued?: number;
  licenseInspected?: boolean;
  handoverNotes?: string;
}

export interface ReturnRecord {
  returnTime?: string;
  closingOdometer?: number;
  damageObserved?: string;
  depositReleased?: boolean;
  depositDeduction?: number;
  depositReleaseNotes?: string;
}

export interface ReviewRecord {
  rating: number;
  comment: string;
  createdAt: string;
}

export interface BookingRecord {
  id: string; // e.g. MOB-2026-8812
  vehicleId: string;
  vehicleName: string;
  vehicleMake: string;
  vehicleCategory: VehicleCategory;
  wheels: VehicleWheels;
  registrationNumber: string;
  vehicleImage: string;
  city: string;
  pickupZone: string;
  pickupAddress: string;

  // Customer info
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  drivingLicense: string;

  // Host info
  ownerId: string;
  ownerName: string;

  // Schedule & pricing
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  rentalDays: number;
  ratePerDay: number;
  baseTotal: number;
  helmetOptionSelected: string;
  helmetFee: number;
  damageWaiver: number;
  platformFee: number; // 10%
  taxes: number; // 5% GST
  securityDeposit: number;
  total: number;

  // Payment
  paymentStatus: "PAID" | "REFUNDED" | "PENDING";
  paymentMethod: "UPI" | "CARD" | "NETBANKING";
  paymentTxnId: string;
  paidAt: string;

  // Status & Handover
  status: BookingStatus;
  handover?: HandoverRecord;
  returnRecord?: ReturnRecord;
  cancellationReason?: string;
  refundAmount?: number;
  cancelledAt?: string;

  review?: ReviewRecord;
  createdAt: string;
}

export interface PayoutRecord {
  id: string;
  ownerId: string;
  ownerName: string;
  amount: number;
  platformCommission: number;
  netSettlement: number;
  status: "PROCESSED" | "PENDING";
  payoutMethod: string;
  destinationAccount: string;
  utrNumber?: string;
  createdAt: string;
}

export interface DisputeRecord {
  id: string;
  bookingId: string;
  raisedBy: string;
  role: UserRole;
  subject: string;
  description: string;
  status: "OPEN" | "RESOLVED";
  resolutionNotes?: string;
  createdAt: string;
}

export interface DatabaseStore {
  users: UserProfile[];
  vehicles: VehicleRecord[];
  bookings: BookingRecord[];
  payouts: PayoutRecord[];
  disputes: DisputeRecord[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "mobility-store.json");

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// Initial seed data designed formally for a campus & urban vehicle rental marketplace
const SEED_USERS: UserProfile[] = [
  {
    id: "usr-cust-1",
    name: "Ananya Raman",
    email: "ananya.r@iiitt.ac.in",
    phone: "+91 98401 23456",
    role: "customer",
    kycStatus: "verified",
    kycDocType: "Driving License & College ID",
    drivingLicense: "TN-09-2023-0045192",
    campusAffiliation: "IIITT Student (B.Tech CSE)",
    rating: 4.95,
  },
  {
    id: "usr-host-1",
    name: "Ramesh Sundaram",
    businessName: "Juniper Two-Wheel Hire",
    email: "ramesh.juniper@gmail.com",
    phone: "+91 94441 78901",
    role: "owner",
    kycStatus: "verified",
    kycDocType: "GSTIN & Commercial Rental Authorization",
    drivingLicense: "TN-01-2015-0012891",
    campusAffiliation: "Authorized Campus Partner (North Gate)",
    bankUpi: "juniperhire@icici",
    rating: 4.96,
  },
  {
    id: "usr-host-2",
    name: "Karthik Venkatesh",
    businessName: "Cornerstone Mobility Co.",
    email: "karthik.cornerstone@gmail.com",
    phone: "+91 98802 34567",
    role: "owner",
    kycStatus: "verified",
    kycDocType: "Business Registration & Owner KYC",
    drivingLicense: "KA-04-2018-0098234",
    campusAffiliation: "Partnered Rental Operator",
    bankUpi: "cornerstone@oksbi",
    rating: 4.92,
  },
  {
    id: "usr-host-3",
    name: "Anand Nair",
    businessName: "Cedar Lane Rentals",
    email: "anand.cedarlane@gmail.com",
    phone: "+91 97450 67890",
    role: "owner",
    kycStatus: "verified",
    kycDocType: "Commercial Fleet License",
    drivingLicense: "KL-07-2016-0044123",
    campusAffiliation: "South Transit Partner",
    bankUpi: "anand.nair@hdfcbank",
    rating: 4.98,
  },
  {
    id: "usr-host-4",
    name: "Pooja Sharma",
    businessName: "CleanRide EV Hub",
    email: "pooja.cleanride@gmail.com",
    phone: "+91 99001 12233",
    role: "owner",
    kycStatus: "verified",
    kycDocType: "Electric Mobility Fleet Authorization",
    drivingLicense: "TN-37-2020-0081290",
    campusAffiliation: "Green Campus Initiative Partner",
    bankUpi: "cleanride@axisbank",
    rating: 4.89,
  },
  {
    id: "usr-admin-1",
    name: "Platform Operations Desk",
    email: "ops@mobility-iiitt.ac.in",
    phone: "+91 98400 00001",
    role: "admin",
    kycStatus: "verified",
    campusAffiliation: "IIITT Campus Transport Office",
  },
];

const SEED_VEHICLES: VehicleRecord[] = [
  // --- 2-WHEELERS ---
  {
    id: "v1",
    ownerId: "usr-host-1",
    ownerName: "Ramesh Sundaram (Juniper Hire)",
    ownerType: "commercial_rental",
    name: "Splendor Plus",
    make: "Hero",
    year: 2023,
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
    registrationNumber: "TN 09 BX 4412",
    insuranceValidTill: "2027-03-31",
    rcVerified: true,
    insuranceVerified: true,
    helmetOption: "1 Helmet Included",
    helmetCondition: "ISI Certified Steelbird helmet with sanitized interior, visor intact",
    rating: 4.95,
    trips: 84,
    image: "/vehicles/hero-splendor.png",
    description:
      "Well-maintained 97.2cc commuter motorcycle. Features reliable drum braking, smooth gear shifts, and exceptional fuel efficiency. Ideal for academic campus errands, local hostel transit, and city rail terminal connections.",
    hostNotes:
      "Pickup from North Gate parking kiosk. Valid two-wheeler driving license required at handover. Fuel level is recorded at handover and must be returned with equal level.",
    guidelines:
      "Helmet mandatory at all times. Pillion rider must wear a certified helmet. Maximum speed limit inside campus grounds is 25 km/h.",
    status: "approved",
    createdAt: "2026-09-01T08:00:00Z",
  },
  {
    id: "v2",
    ownerId: "usr-host-2",
    ownerName: "Karthik Venkatesh (Cornerstone)",
    ownerType: "commercial_rental",
    name: "Pulsar 150",
    make: "Bajaj",
    year: 2024,
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
    registrationNumber: "KA 04 EL 9120",
    insuranceValidTill: "2027-06-30",
    rcVerified: true,
    insuranceVerified: true,
    helmetOption: "1 Helmet Included",
    helmetCondition: "Studds Ninja ISI-certified full-face helmet provided",
    rating: 4.92,
    trips: 56,
    image: "/vehicles/bajaj-pulsar.png",
    description:
      "150cc DTS-i twin spark motorcycle with front disc brake and digital instrument cluster. Fully serviced with fresh engine oil and verified tire tread. Well-suited for longer inter-campus transit, research park visits, and city commutes.",
    hostNotes:
      "Handover available daily between 7:30 AM and 8:30 PM. Instant verification with student ID and original DL.",
    guidelines:
      "Strictly no stunt riding or reckless maneuvers. Vehicle is equipped with standard telemetry for safety compliance.",
    status: "approved",
    createdAt: "2026-09-05T09:30:00Z",
  },
  {
    id: "v3",
    ownerId: "usr-host-3",
    ownerName: "Anand Nair (Cedar Lane)",
    ownerType: "commercial_rental",
    name: "Classic 350",
    make: "Royal Enfield",
    year: 2023,
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
    registrationNumber: "KL 07 CD 2309",
    insuranceValidTill: "2027-05-15",
    rcVerified: true,
    insuranceVerified: true,
    helmetOption: "2 Helmets Included",
    helmetCondition: "Two Royal Enfield ISI open-face helmets with protective visors",
    rating: 4.98,
    trips: 62,
    image: "/vehicles/royal-enfield.png",
    description:
      "349cc J-Series touring motorcycle. Upright ergonomic riding posture, dual-channel ABS, and robust build. Maintained meticulously through authorized service centers for comfortable suburban trips and weekend research travel.",
    hostNotes:
      "Original physical driving license must be inspected upon key collection. Full vehicle inspection sheet signed before departure.",
    guidelines:
      "Dual helmets included and required. Adhere strictly to state highway and institutional speed regulations.",
    status: "approved",
    createdAt: "2026-09-10T11:00:00Z",
  },
  {
    id: "v4",
    ownerId: "usr-host-4",
    ownerName: "Pooja Sharma (CleanRide EV)",
    ownerType: "commercial_rental",
    name: "450X Gen 3",
    make: "Ather",
    year: 2024,
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
    registrationNumber: "TN 37 EV 1044",
    insuranceValidTill: "2027-08-20",
    rcVerified: true,
    insuranceVerified: true,
    helmetOption: "1 Helmet Included",
    helmetCondition: "Vega Crux ISI helmet with quick-release chin strap",
    rating: 4.89,
    trips: 41,
    image: "/vehicles/ather-450x.png",
    description:
      "All-electric smart scooter equipped with 3.7 kWh battery pack, connected navigation, and regenerative braking. Quiet, zero-emission campus mobility with 105 km real-world range per charge. Provided with portable home/hostel charger cable.",
    hostNotes:
      "Vehicle is issued at 100% state of charge. Free charging available at the CleanRide charging dock at the East Library Plaza.",
    guidelines:
      "Please return with at least 20% state of charge. Helmet required for operator and passenger.",
    status: "approved",
    createdAt: "2026-09-12T14:15:00Z",
  },

  // --- 4-WHEELERS ---
  {
    id: "v5",
    ownerId: "usr-host-4",
    ownerName: "Pooja Sharma (CleanRide)",
    ownerType: "individual",
    name: "Nano Twist",
    make: "Tata",
    year: 2022,
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
    registrationNumber: "TN 37 CB 5521",
    insuranceValidTill: "2027-01-20",
    rcVerified: true,
    insuranceVerified: true,
    helmetOption: "Not Applicable",
    rating: 4.86,
    trips: 37,
    image: "/vehicles/tata-nano.png",
    description:
      "Compact urban city car featuring power steering, air conditioning, and outstanding maneuverability. Perfect for student project team transportation, campus grocery supplies, and narrow campus-edge access roads.",
    hostNotes:
      "Clean interior with sanitized touchpoints. Spare tire and toolkit checked in rear compartment.",
    guidelines:
      "Seatbelts mandatory for all 4 occupants. No smoking or consumption inside vehicle.",
    status: "approved",
    createdAt: "2026-09-15T10:00:00Z",
  },
  {
    id: "v6",
    ownerId: "usr-host-2",
    ownerName: "Karthik Venkatesh (Cornerstone)",
    ownerType: "commercial_rental",
    name: "City i-VTEC",
    make: "Honda",
    year: 2023,
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
    registrationNumber: "KA 04 MC 8830",
    insuranceValidTill: "2027-09-15",
    rcVerified: true,
    insuranceVerified: true,
    helmetOption: "Not Applicable",
    rating: 4.96,
    trips: 49,
    image: "/vehicles/honda-city.png",
    description:
      "1.5-litre 4-cylinder executive sedan with rear AC vents, touch infotainment, and large 506-litre trunk capacity. Excellent safety rating with 6 airbags and Vehicle Stability Assist. Ideal for airport runs, faculty transit, and official delegation travel.",
    hostNotes:
      "Fastag enabled on windshield for toll highways. Fastag recharge settled upon return.",
    guidelines:
      "Valid 4-wheeler (LMV) driving license with minimum 1 year validity required. Commercial trip logging applies.",
    status: "approved",
    createdAt: "2026-09-18T16:00:00Z",
  },
  {
    id: "v7",
    ownerId: "usr-host-3",
    ownerName: "Anand Nair (Cedar Lane)",
    ownerType: "commercial_rental",
    name: "Thar 4×4",
    make: "Mahindra",
    year: 2023,
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
    registrationNumber: "KL 07 BK 7701",
    insuranceValidTill: "2027-07-31",
    rcVerified: true,
    insuranceVerified: true,
    helmetOption: "Not Applicable",
    rating: 4.94,
    trips: 58,
    image: "/vehicles/mahindra-thar.png",
    description:
      "All-terrain 4WD vehicle with 226 mm ground clearance, roll cage structure, and diesel powertrain. Maintained for rugged topography and regional research expeditions.",
    hostNotes:
      "Requires experienced manual 4WD operator. Pre-rental damage map recorded with photos.",
    guidelines:
      "Off-road driving must comply with designated trails only. Zero alcohol policy strictly enforced.",
    status: "approved",
    createdAt: "2026-09-20T12:00:00Z",
  },
  {
    id: "v8",
    ownerId: "usr-host-1",
    ownerName: "Ramesh Sundaram (Juniper Hire)",
    ownerType: "commercial_rental",
    name: "Creta SX",
    make: "Hyundai",
    year: 2024,
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
    registrationNumber: "TN 09 DX 1205",
    insuranceValidTill: "2027-08-30",
    rcVerified: true,
    insuranceVerified: true,
    helmetOption: "Not Applicable",
    rating: 4.91,
    trips: 52,
    image: "/vehicles/hyundai-creta.png",
    description:
      "Premium 5-seater mid-size SUV with automatic transmission, panoramic sunroof, wireless charging, and cruise control. Highly comfortable ride quality for campus visits and intercity travel.",
    hostNotes:
      "Includes 24/7 roadside assistance package. Full tank handover option available.",
    guidelines:
      "LMV driving license mandatory. Please return in clean condition to avoid detailing fee.",
    status: "approved",
    createdAt: "2026-09-22T08:30:00Z",
  },
];

const SEED_BOOKINGS: BookingRecord[] = [
  {
    id: "MOB-24081",
    vehicleId: "v1",
    vehicleName: "Splendor Plus",
    vehicleMake: "Hero",
    vehicleCategory: "Bike",
    wheels: "2-Wheeler",
    registrationNumber: "TN 09 BX 4412",
    vehicleImage: "/vehicles/hero-splendor.png",
    city: "Chennai",
    pickupZone: "North Campus Gate / Transit Hub",
    pickupAddress: "Kiosk #3, North Gate Commercial Complex",
    customerId: "usr-cust-1",
    customerName: "Ananya Raman",
    customerEmail: "ananya.r@iiitt.ac.in",
    customerPhone: "+91 98401 23456",
    drivingLicense: "TN-09-2023-0045192",
    ownerId: "usr-host-1",
    ownerName: "Ramesh Sundaram (Juniper Hire)",
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
    paymentStatus: "PAID",
    paymentMethod: "UPI",
    paymentTxnId: "UPI/261018894120/AXIS",
    paidAt: "2026-10-14T11:20:00Z",
    status: "CONFIRMED",
    createdAt: "2026-10-14T11:20:00Z",
  },
  {
    id: "MOB-24065",
    vehicleId: "v6",
    vehicleName: "City i-VTEC",
    vehicleMake: "Honda",
    vehicleCategory: "Sedan",
    wheels: "4-Wheeler",
    registrationNumber: "KA 04 MC 8830",
    vehicleImage: "/vehicles/honda-city.png",
    city: "Bengaluru",
    pickupZone: "Central Administrative Ring",
    pickupAddress: "Administrative Gate Parking Lot, Slot A4",
    customerId: "usr-cust-1",
    customerName: "Ananya Raman",
    customerEmail: "ananya.r@iiitt.ac.in",
    customerPhone: "+91 98401 23456",
    drivingLicense: "TN-09-2023-0045192",
    ownerId: "usr-host-2",
    ownerName: "Karthik Venkatesh (Cornerstone)",
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
    paymentStatus: "PAID",
    paymentMethod: "CARD",
    paymentTxnId: "TXN_CC_998124065",
    paidAt: "2026-10-07T14:10:00Z",
    status: "COMPLETED",
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
      createdAt: "2026-10-09T20:00:00Z",
    },
    createdAt: "2026-10-07T14:10:00Z",
  },
];

const SEED_PAYOUTS: PayoutRecord[] = [
  {
    id: "PAY-9011",
    ownerId: "usr-host-2",
    ownerName: "Karthik Venkatesh (Cornerstone)",
    amount: 2200,
    platformCommission: 220,
    netSettlement: 1980,
    status: "PROCESSED",
    payoutMethod: "UPI Settlement",
    destinationAccount: "cornerstone@oksbi",
    utrNumber: "UTR-AXIS-2026100988112",
    createdAt: "2026-10-10T09:00:00Z",
  },
];

const SEED_DISPUTES: DisputeRecord[] = [];

function loadDatabase(): DatabaseStore {
  try {
    ensureDirectoryExistence(DB_FILE);
    if (!fs.existsSync(DB_FILE)) {
      const initial: DatabaseStore = {
        users: SEED_USERS,
        vehicles: SEED_VEHICLES,
        bookings: SEED_BOOKINGS,
        payouts: SEED_PAYOUTS,
        disputes: SEED_DISPUTES,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw) as DatabaseStore;
  } catch (err) {
    console.error("Error reading database file:", err);
    return {
      users: SEED_USERS,
      vehicles: SEED_VEHICLES,
      bookings: SEED_BOOKINGS,
      payouts: SEED_PAYOUTS,
      disputes: SEED_DISPUTES,
    };
  }
}

function saveDatabase(data: DatabaseStore) {
  ensureDirectoryExistence(DB_FILE);
  const tmpFile = DB_FILE + ".tmp";
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmpFile, DB_FILE);
}

// Thread-safe / In-process database helper functions
export const db = {
  getStore(): DatabaseStore {
    return loadDatabase();
  },

  // USERS
  getUsers(): UserProfile[] {
    return loadDatabase().users;
  },

  getUserById(id: string): UserProfile | undefined {
    return loadDatabase().users.find((u) => u.id === id);
  },

  saveUser(user: UserProfile): UserProfile {
    const data = loadDatabase();
    const idx = data.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      data.users[idx] = user;
    } else {
      data.users.push(user);
    }
    saveDatabase(data);
    return user;
  },

  updateUserKyc(
    userId: string,
    status: "verified" | "pending" | "unverified",
    docType?: string
  ): UserProfile | null {
    const data = loadDatabase();
    const user = data.users.find((u) => u.id === userId);
    if (!user) return null;
    user.kycStatus = status;
    if (docType) user.kycDocType = docType;
    saveDatabase(data);
    return user;
  },

  // VEHICLES
  getVehicles(filter?: {
    city?: string;
    category?: string;
    wheels?: string;
    ownerId?: string;
    status?: VehicleListingStatus;
    search?: string;
  }): VehicleRecord[] {
    const data = loadDatabase();
    return data.vehicles.filter((v) => {
      if (filter?.status && v.status !== filter.status) return false;
      if (filter?.ownerId && v.ownerId !== filter.ownerId) return false;
      if (filter?.city && filter.city !== "All locations" && v.city !== filter.city)
        return false;
      if (
        filter?.category &&
        filter.category !== "All types" &&
        v.category !== filter.category
      )
        return false;
      if (
        filter?.wheels &&
        filter.wheels !== "All vehicles" &&
        v.wheels !== filter.wheels
      )
        return false;
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        const text = [
          v.name,
          v.make,
          v.city,
          v.campusZone,
          v.category,
          v.description,
          v.registrationNumber,
        ]
          .join(" ")
          .toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  },

  getVehicleById(id: string): VehicleRecord | undefined {
    return loadDatabase().vehicles.find((v) => v.id === id);
  },

  createVehicle(vehicle: Omit<VehicleRecord, "id" | "createdAt">): VehicleRecord {
    const data = loadDatabase();
    const newVehicle: VehicleRecord = {
      ...vehicle,
      id: "v-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
    };
    data.vehicles.unshift(newVehicle);
    saveDatabase(data);
    return newVehicle;
  },

  updateVehicle(
    id: string,
    updates: Partial<VehicleRecord>
  ): VehicleRecord | null {
    const data = loadDatabase();
    const idx = data.vehicles.findIndex((v) => v.id === id);
    if (idx < 0) return null;
    data.vehicles[idx] = { ...data.vehicles[idx], ...updates };
    saveDatabase(data);
    return data.vehicles[idx];
  },

  setVehicleStatus(
    id: string,
    status: VehicleListingStatus,
    reason?: string
  ): VehicleRecord | null {
    const data = loadDatabase();
    const v = data.vehicles.find((item) => item.id === id);
    if (!v) return null;
    v.status = status;
    if (reason) v.rejectionReason = reason;
    saveDatabase(data);
    return v;
  },

  // BOOKINGS
  getBookings(filter?: {
    customerId?: string;
    ownerId?: string;
    vehicleId?: string;
    status?: BookingStatus;
  }): BookingRecord[] {
    const data = loadDatabase();
    return data.bookings.filter((b) => {
      if (filter?.customerId && b.customerId !== filter.customerId) return false;
      if (filter?.ownerId && b.ownerId !== filter.ownerId) return false;
      if (filter?.vehicleId && b.vehicleId !== filter.vehicleId) return false;
      if (filter?.status && b.status !== filter.status) return false;
      return true;
    });
  },

  getBookingById(id: string): BookingRecord | undefined {
    return loadDatabase().bookings.find((b) => b.id === id);
  },

  // Check for reservation concurrency / date conflicts
  checkAvailability(
    vehicleId: string,
    start: string,
    end: string,
    excludeBookingId?: string
  ): boolean {
    const data = loadDatabase();
    // Rental date ranges are half-open: [pick-up, return). This lets a new
    // renter pick up on the previous renter's return date.
    const targetStart = Date.parse(`${start}T00:00:00.000Z`);
    const targetEnd = Date.parse(`${end}T00:00:00.000Z`);
    if (!Number.isFinite(targetStart) || !Number.isFinite(targetEnd) || targetEnd <= targetStart) {
      return false;
    }

    const active = data.bookings.filter(
      (b) =>
        b.vehicleId === vehicleId &&
        b.id !== excludeBookingId &&
        b.status !== "CANCELLED" &&
        b.status !== "COMPLETED" &&
        b.paymentStatus !== "PENDING"
    );

    for (const b of active) {
      const bStart = Date.parse(`${b.start}T00:00:00.000Z`);
      const bEnd = Date.parse(`${b.end}T00:00:00.000Z`);
      if (Number.isFinite(bStart) && Number.isFinite(bEnd) && targetStart < bEnd && targetEnd > bStart) {
        return false;
      }
    }
    return true;
  },

  createBooking(
    booking: Omit<BookingRecord, "id" | "createdAt">
  ): BookingRecord {
    const data = loadDatabase();
    const id = "MOB-" + Math.floor(100000 + Math.random() * 900000);
    const newBooking: BookingRecord = {
      ...booking,
      id,
      createdAt: new Date().toISOString(),
    };
    data.bookings.unshift(newBooking);

    // Update vehicle trip count
    const v = data.vehicles.find((item) => item.id === booking.vehicleId);
    if (v) {
      v.trips += 1;
    }

    saveDatabase(data);
    return newBooking;
  },

  updateBookingStatus(
    id: string,
    status: BookingStatus,
    extra?: {
      handover?: HandoverRecord;
      returnRecord?: ReturnRecord;
      cancellationReason?: string;
      refundAmount?: number;
    }
  ): BookingRecord | null {
    const data = loadDatabase();
    const b = data.bookings.find((item) => item.id === id);
    if (!b) return null;
    b.status = status;
    if (extra?.handover) {
      b.handover = { ...b.handover, ...extra.handover };
    }
    if (extra?.returnRecord) {
      b.returnRecord = { ...b.returnRecord, ...extra.returnRecord };
    }
    if (extra?.cancellationReason) {
      b.cancellationReason = extra.cancellationReason;
      b.cancelledAt = new Date().toISOString();
    }
    if (extra?.refundAmount !== undefined) {
      b.refundAmount = extra.refundAmount;
      b.paymentStatus = "REFUNDED";
    }
    saveDatabase(data);
    return b;
  },

  addBookingReview(
    bookingId: string,
    rating: number,
    comment: string
  ): BookingRecord | null {
    const data = loadDatabase();
    const b = data.bookings.find((item) => item.id === bookingId);
    if (!b) return null;
    b.review = {
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    // Update vehicle average rating
    const vehicleBookings = data.bookings.filter(
      (item) => item.vehicleId === b.vehicleId && item.review
    );
    const totalRating = vehicleBookings.reduce(
      (sum, item) => sum + (item.review?.rating || 5),
      0
    );
    const v = data.vehicles.find((item) => item.id === b.vehicleId);
    if (v && vehicleBookings.length > 0) {
      v.rating = Number((totalRating / vehicleBookings.length).toFixed(2));
    }

    saveDatabase(data);
    return b;
  },

  // PAYOUTS
  getPayouts(ownerId?: string): PayoutRecord[] {
    const data = loadDatabase();
    if (ownerId) {
      return data.payouts.filter((p) => p.ownerId === ownerId);
    }
    return data.payouts;
  },

  createPayout(
    ownerId: string,
    ownerName: string,
    amount: number,
    payoutMethod: string,
    destinationAccount: string
  ): PayoutRecord {
    const data = loadDatabase();
    const platformCommission = Math.round(amount * 0.1);
    const netSettlement = amount - platformCommission;
    const payout: PayoutRecord = {
      id: "PAY-" + Math.floor(1000 + Math.random() * 9000),
      ownerId,
      ownerName,
      amount,
      platformCommission,
      netSettlement,
      status: "PROCESSED",
      payoutMethod,
      destinationAccount,
      utrNumber: "UTR-IMPS-" + Date.now().toString().slice(-8),
      createdAt: new Date().toISOString(),
    };
    data.payouts.unshift(payout);
    saveDatabase(data);
    return payout;
  },

  // DISPUTES
  getDisputes(): DisputeRecord[] {
    return loadDatabase().disputes;
  },

  createDispute(
    bookingId: string,
    raisedBy: string,
    role: UserRole,
    subject: string,
    description: string
  ): DisputeRecord {
    const data = loadDatabase();
    const disp: DisputeRecord = {
      id: "DSP-" + Math.floor(1000 + Math.random() * 9000),
      bookingId,
      raisedBy,
      role,
      subject,
      description,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };
    data.disputes.unshift(disp);
    saveDatabase(data);
    return disp;
  },

  resolveDispute(id: string, resolutionNotes: string): DisputeRecord | null {
    const data = loadDatabase();
    const d = data.disputes.find((item) => item.id === id);
    if (!d) return null;
    d.status = "RESOLVED";
    d.resolutionNotes = resolutionNotes;
    saveDatabase(data);
    return d;
  },
};
