import { daysBetween, seedVehicles, type Booking, type Vehicle } from "@/lib/data";

const BOOKINGS_KEY = "mobility_demo_bookings_v1";

export type DemoBookingInput = {
  vehicle: Vehicle;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  drivingLicense: string;
  start: string;
  end: string;
  paymentMethod: "UPI" | "CARD" | "NETBANKING";
  helmetOptionSelected: string;
};

export function readDemoBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BOOKINGS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Booking[]) : [];
  } catch {
    return [];
  }
}

function writeDemoBookings(bookings: Booking[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function createDemoBooking(input: DemoBookingInput): Booking {
  const { vehicle } = input;
  const rentalDays = daysBetween(input.start, input.end);
  const baseTotal = vehicle.price * rentalDays;
  const isTwoWheeler = vehicle.wheels === "2-Wheeler";
  const damageWaiver = (isTwoWheeler ? 50 : 150) * rentalDays;
  const platformFee = Math.round(baseTotal * 0.1);
  const taxes = Math.round((baseTotal + platformFee) * 0.05);
  const id = "MOB-DEMO-" + Date.now().toString(36).toUpperCase();

  const booking: Booking = {
    id,
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    vehicleMake: vehicle.make,
    city: vehicle.city,
    pickupZone: vehicle.campusZone,
    pickupAddress: vehicle.pickupAddress,
    registrationNumber: vehicle.registrationNumber,
    start: input.start,
    end: input.end,
    total: baseTotal + damageWaiver + platformFee + taxes,
    rentalDays,
    ratePerDay: vehicle.price,
    baseTotal,
    damageWaiver,
    platformFee,
    taxes,
    securityDeposit: vehicle.deposit || (isTwoWheeler ? 500 : 2000),
    status: "CONFIRMED",
    guest: input.customerName,
    customerId: input.customerId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    drivingLicense: input.drivingLicense,
    ownerId: vehicle.ownerId || "usr-host-1",
    ownerName: vehicle.host,
    paymentStatus: "PENDING",
    paymentMethod: input.paymentMethod,
    paymentTxnId: "DEMO-NOT-A-REAL-TRANSACTION",
    helmetOptionSelected: input.helmetOptionSelected,
  };

  writeDemoBookings([booking, ...readDemoBookings()]);
  return booking;
}

export type DemoHandover = {
  startingOdometer: number;
  fuelBatteryLevel: string;
  helmetsIssued: number;
  licenseInspected: boolean;
  handoverNotes: string;
};

export type DemoReturn = {
  closingOdometer: number;
  damageObserved: string;
  depositDeduction?: number;
};

export function updateDemoBooking(
  id: string,
  action: "cancel" | "handover" | "return",
  payload: { reason?: string; handover?: DemoHandover; returnRecord?: DemoReturn } = {},
): Booking | null {
  const bookings = readDemoBookings();
  const index = bookings.findIndex((booking) => booking.id === id);
  if (index < 0) return null;

  const booking = bookings[index];
  const now = new Date().toISOString();

  if (action === "cancel") {
    if (["ACTIVE_TRIP", "RETURNED", "COMPLETED", "CANCELLED"].includes(booking.status)) return null;
    bookings[index] = { ...booking, status: "CANCELLED" };
  } else if (action === "handover") {
    if (!["CONFIRMED", "HANDOVER_PENDING"].includes(booking.status) || !payload.handover) return null;
    const handover = payload.handover;
    if (!Number.isFinite(handover.startingOdometer) || handover.startingOdometer < 0 ||
        !handover.fuelBatteryLevel.trim() || !Number.isInteger(handover.helmetsIssued) ||
        handover.helmetsIssued < 0 || handover.helmetsIssued > 4 || !handover.licenseInspected ||
        !handover.handoverNotes.trim()) return null;
    bookings[index] = {
      ...booking,
      status: "ACTIVE_TRIP",
      handover: { ...handover, handoverTime: now },
    };
  } else {
    if (booking.status !== "ACTIVE_TRIP" || !payload.returnRecord) return null;
    const record = payload.returnRecord;
    if (!Number.isFinite(record.closingOdometer) || record.closingOdometer < 0 ||
        (booking.handover?.startingOdometer !== undefined &&
          record.closingOdometer < booking.handover.startingOdometer) ||
        !record.damageObserved.trim()) return null;
    bookings[index] = {
      ...booking,
      status: "COMPLETED",
      returnRecord: {
        ...record,
        returnTime: now,
        depositReleased: false,
        depositReleaseNotes: "Demo record only. No security deposit was collected or released.",
      },
    };
  }

  writeDemoBookings(bookings);
  return bookings[index];
}

export function getDemoHostData(ownerId: string) {
  const vehicles = seedVehicles.filter((vehicle) => (vehicle.ownerId || "usr-host-1") === ownerId);
  const bookings = readDemoBookings().filter((booking) => booking.ownerId === ownerId);
  const grossBookingsAmount = bookings
    .filter((booking) => booking.status !== "CANCELLED")
    .reduce((sum, booking) => sum + (booking.baseTotal || booking.total), 0);
  const platformCommission = Math.round(grossBookingsAmount * 0.1);
  const totalEarnings = grossBookingsAmount - platformCommission;
  const activeRentals = bookings.filter(
    (booking) => booking.status === "CONFIRMED" || booking.status === "ACTIVE_TRIP",
  ).length;
  const completedRentals = bookings.filter((booking) => booking.status === "COMPLETED").length;

  return {
    owner: undefined,
    vehiclesCount: vehicles.length,
    vehicles,
    bookings,
    payouts: [],
    metrics: {
      grossBookingsAmount,
      platformCommission,
      totalEarnings,
      settledAmount: 0,
      pendingSettlement: totalEarnings,
      activeRentals,
      completedRentals,
    },
  };
}


export function getDemoAdminData() {
  const vehicles = seedVehicles;
  const bookings = readDemoBookings();
  const totalGrossRevenue = bookings
    .filter((booking) => booking.status !== "CANCELLED")
    .reduce((sum, booking) => sum + booking.total, 0);
  const platformCommissionCollected = bookings
    .filter((booking) => booking.status !== "CANCELLED")
    .reduce((sum, booking) => sum + (booking.platformFee || 0), 0);

  return {
    metrics: {
      totalVehicles: vehicles.length,
      pendingVehicles: vehicles.filter((vehicle) => vehicle.status === "pending_review").length,
      approvedVehicles: vehicles.filter((vehicle) => vehicle.status === "approved").length,
      totalBookings: bookings.length,
      totalGrossRevenue,
      platformCommissionCollected,
      pendingKycUsers: 0,
      totalUsers: 0,
    },
    vehicles,
    bookings,
    users: [],
    payouts: [],
    disputes: [],
  };
}
