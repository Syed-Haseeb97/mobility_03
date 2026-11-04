export interface CampusZone {
  id: string;
  city: string;
  name: string;
  code: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  landmarks: string[];
  operatingHours: string;
  pickupAllowed: boolean;
  dropoffAllowed: boolean;
}

export const CAMPUS_ZONES: CampusZone[] = [
  // --- CHENNAI ---
  {
    id: "chennai-north-gate",
    city: "Chennai",
    name: "North Campus Gate / Transit Hub",
    code: "CHN-NG",
    coordinates: { lat: 12.9915, lng: 80.2337 },
    description: "Main campus entrance opposite Central Library and Guindy transit hub. Rapid access to city bus terminal and suburban train station.",
    landmarks: ["Main Entrance", "Central Library", "Kiosk #3 Commercial Complex"],
    operatingHours: "06:00 - 23:00",
    pickupAllowed: true,
    dropoffAllowed: true,
  },
  {
    id: "chennai-south-gate",
    city: "Chennai",
    name: "South Campus Gate / Research Park",
    code: "CHN-SG",
    coordinates: { lat: 12.9862, lng: 80.2412 },
    description: "Dedicated access for IIT Madras Research Park, incubation cells, and aerospace engineering departments.",
    landmarks: ["Research Park Tower A", "Aerospace Lab", "Cafeteria Quad"],
    operatingHours: "07:00 - 22:00",
    pickupAllowed: true,
    dropoffAllowed: true,
  },
  {
    id: "chennai-hostel-zone",
    city: "Chennai",
    name: "Hostel Zone / Mandakini Quad",
    code: "CHN-HZ",
    coordinates: { lat: 12.9880, lng: 80.2285 },
    description: "Hostel cluster hub serving Mandakini, Alakananda, and Brahmaputra student residencies.",
    landmarks: ["Mandakini Food Court", "Student Council Office", "Sports Complex"],
    operatingHours: "24 Hours",
    pickupAllowed: true,
    dropoffAllowed: true,
  },

  // --- BENGALURU ---
  {
    id: "blr-hostel-d",
    city: "Bengaluru",
    name: "Student Quarter / Hostel Block D",
    code: "BLR-HD",
    coordinates: { lat: 12.9344, lng: 77.6056 },
    description: "IISc / Koramangala student quarters with dedicated two-wheeler bays and electric charging docks.",
    landmarks: ["Hostel Block D Parking Bay", "Cornerstone Hub", "Recreation Center"],
    operatingHours: "06:00 - 23:30",
    pickupAllowed: true,
    dropoffAllowed: true,
  },
  {
    id: "blr-admin-ring",
    city: "Bengaluru",
    name: "Central Administrative Ring",
    code: "BLR-AR",
    coordinates: { lat: 13.0184, lng: 77.5670 },
    description: "IISc Main Faculty & Administrative Plaza with secure shaded parking bay A4.",
    landmarks: ["Main Building", "Faculty Senate House", "Bank Branch Bay A4"],
    operatingHours: "07:30 - 21:00",
    pickupAllowed: true,
    dropoffAllowed: true,
  },
  {
    id: "blr-tech-gate",
    city: "Bengaluru",
    name: "Tech Innovation Gate 2",
    code: "BLR-TG",
    coordinates: { lat: 12.9372, lng: 77.6105 },
    description: "Edge transit terminal connecting student campus with adjacent technology incubators and metro shuttle feeder.",
    landmarks: ["Gate 2 Terminal", "Metro Feeder Stand", "Incubator Plaza"],
    operatingHours: "06:00 - 23:00",
    pickupAllowed: true,
    dropoffAllowed: true,
  },

  // --- KOCHI ---
  {
    id: "kochi-west-promenade",
    city: "Kochi",
    name: "West Campus Promenade",
    code: "KOC-WP",
    coordinates: { lat: 10.0435, lng: 76.3242 },
    description: "CUSAT Kalamassery campus west entry on ring road with Cedar Lane Vehicle Depot.",
    landmarks: ["West Campus Gate #2", "Cedar Lane Depot", "Engineering Annex"],
    operatingHours: "07:00 - 22:30",
    pickupAllowed: true,
    dropoffAllowed: true,
  },
  {
    id: "kochi-central-library",
    city: "Kochi",
    name: "University Library Hub",
    code: "KOC-UL",
    coordinates: { lat: 10.0410, lng: 76.3280 },
    description: "Centrally positioned university transit point adjacent to student cafeteria and central library.",
    landmarks: ["Central Library Plaza", "Student Union Hall"],
    operatingHours: "24 Hours",
    pickupAllowed: true,
    dropoffAllowed: true,
  },

  // --- COIMBATORE ---
  {
    id: "cbe-library-approach",
    city: "Coimbatore",
    name: "Library Approach / Tech Park Terminal",
    code: "CBE-LA",
    coordinates: { lat: 11.0168, lng: 76.9558 },
    description: "Peelamedu campus hub equipped with CleanRide EV fast chargers and sheltered parking stalls.",
    landmarks: ["East Library Plaza", "CleanRide Charging Station", "Auditorium Portico"],
    operatingHours: "06:00 - 23:00",
    pickupAllowed: true,
    dropoffAllowed: true,
  },
  {
    id: "cbe-hostel-quarter",
    city: "Coimbatore",
    name: "Student Quarter / Hostel Area",
    code: "CBE-HQ",
    coordinates: { lat: 11.0280, lng: 76.9360 },
    description: "Residential campus zone near staff enclave and student hostel blocks with Bay 12 vehicle pickup.",
    landmarks: ["Residential Staff Enclave Bay 12", "Hostel Block 4", "Campus Health Center"],
    operatingHours: "24 Hours",
    pickupAllowed: true,
    dropoffAllowed: true,
  },

  // --- HYDERABAD ---
  {
    id: "hyd-gachibowli-gate",
    city: "Hyderabad",
    name: "Campus Main Gate / Gachibowli Edge",
    code: "HYD-MG",
    coordinates: { lat: 17.4455, lng: 78.3489 },
    description: "IIIT-H / HCU Gachibowli transit concourse with immediate link to Financial District corridors.",
    landmarks: ["Main Security Portico", "Transit Shelter", "Himalaya Dining Hall"],
    operatingHours: "06:00 - 23:30",
    pickupAllowed: true,
    dropoffAllowed: true,
  },
  {
    id: "hyd-hostel-hub",
    city: "Hyderabad",
    name: "Bakul / Parijaat Hostel Concourse",
    code: "HYD-HH",
    coordinates: { lat: 17.4478, lng: 78.3512 },
    description: "Student residential pickup bay with overnight vehicle staging and helmet sanitization kiosk.",
    landmarks: ["Bakul Nivas Courtyard", "Campus Store", "Café Coffee Day Bay"],
    operatingHours: "24 Hours",
    pickupAllowed: true,
    dropoffAllowed: true,
  },

  // --- MUMBAI ---
  {
    id: "mum-powai-main",
    city: "Mumbai",
    name: "IIT Main Gate / Powai Edge",
    code: "MUM-MG",
    coordinates: { lat: 19.1254, lng: 72.9152 },
    description: "Powai campus main terminal with sheltered bays for two-wheelers and electric fleet charging.",
    landmarks: ["Powai Main Gate", "SBI Campus Branch", "Gulmohar Building"],
    operatingHours: "06:00 - 23:30",
    pickupAllowed: true,
    dropoffAllowed: true,
  },
  {
    id: "mum-hostel-quad",
    city: "Mumbai",
    name: "Hostel 12-14 Concourse",
    code: "MUM-HQ",
    coordinates: { lat: 19.1332, lng: 72.9128 },
    description: "North lakeside campus zone serving graduate and undergraduate residential hostel clusters.",
    landmarks: ["Hostel 14 Quad", "Lakeside Track", "Gymkhana Grounds"],
    operatingHours: "24 Hours",
    pickupAllowed: true,
    dropoffAllowed: true,
  },
];

/**
 * Calculate Great-Circle distance using Haversine formula (in kilometers).
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

export function getAllCampusZones(): CampusZone[] {
  return CAMPUS_ZONES;
}

export function getCampusZonesByCity(city?: string): CampusZone[] {
  if (!city || city === "All locations") return CAMPUS_ZONES;
  const normalized = city.toLowerCase().trim();
  return CAMPUS_ZONES.filter((zone) => zone.city.toLowerCase() === normalized);
}

export function getCampusZoneById(id: string): CampusZone | undefined {
  return CAMPUS_ZONES.find((z) => z.id === id);
}

export function findNearestCampusZone(
  lat: number,
  lng: number,
  city?: string
): { zone: CampusZone; distanceKm: number } | null {
  const zones = getCampusZonesByCity(city);
  if (!zones.length) return null;

  let nearest = zones[0];
  let minDistance = haversineDistance(lat, lng, nearest.coordinates.lat, nearest.coordinates.lng);

  for (let i = 1; i < zones.length; i++) {
    const d = haversineDistance(lat, lng, zones[i].coordinates.lat, zones[i].coordinates.lng);
    if (d < minDistance) {
      minDistance = d;
      nearest = zones[i];
    }
  }

  return { zone: nearest, distanceKm: minDistance };
}

export function isValidCoordinate(lat?: unknown, lng?: unknown): boolean {
  if (typeof lat !== "number" || typeof lng !== "number") return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
