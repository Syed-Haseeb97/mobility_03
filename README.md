# MOBILITY — Campus Vehicle-Rental Marketplace

MOBILITY is an engineering-grade vehicle-rental marketplace engineered specifically for university campuses, research institutions, and adjacent student-dense technology clusters.

---

## 1. Core Architecture

- **Framework:** Next.js (App Router) + React 19 + TypeScript (strict mode).
- **Styling:** Tailwind CSS + Vanilla CSS variables for high-contrast, institutional campus theme.
- **Mapping & Geospatial:** Dynamic Leaflet with CARTO Positron map tiles, OpenStreetMap fallback, and interactive marker/polyline layers.
- **Routing Engine:** OpenRouteService with secondary OSRM fallback and a calibrated campus road topology estimator.
- **Meteorological Engine:** Open-Meteo API providing real-time precipitation risk and tailored 2-wheeler / 4-wheeler travel advisories.
- **Geocoding & Reverse Geocoding:** Multi-tier geocoder supporting campus zones gazetteer, OpenCage (if configured), and OpenStreetMap Nominatim with strict rate limiting.
- **Data & State Management:** In-memory transactional data store with persistent disk fallback (`data/mobility-store.json`) and client-side offline storage.
- **Testing:** Native Node.js Test Runner with TypeScript execution via `tsx`.

---

## 2. Main Route Directory

- `/` — Campus-first landing page with animated hero, date-aware search, vehicle categories, published listings, rental steps, and partner CTA.
- `/rent` — Vehicle marketplace catalog with campus zone filter, vehicle type filter (2-Wheeler vs 4-Wheeler), category, sort controls, and **Interactive Map View** toggle.
- `/rent/vehicle/[id]` — Detailed vehicle profile with interactive **Journey Planner**, route distance/duration calculator, live weather cards, and checkout desk.
- `/rent/bookings` — Customer trips dashboard: upcoming rides, active journeys, completed trips, route corridor records, and tax invoices.
- `/host/dashboard` — Partner command center: live fleet stats, gross bookings, 10% platform commission, pending settlements, and disbursal requests.
- `/host/listings` — Partner garage management: view active listings, toggle pause/active status, and view live vehicle profiles.
- `/host/add-vehicle` — 3-step listing builder with campus zone preset selector, custom host description editor, helmet arrangement, and pricing.
- `/list-your-vehicle` — Partner program onboarding and operational architecture.
- `/guidelines` — Formal campus ground rules, student pre-departure checklist, partner hygiene standards, and verification evidence philosophy.
- `/admin` — Platform operations desk: vehicle moderation queue, KYC credential approvals, master booking ledger, and settlement disbursals.
- `/api/geo/*` — Geospatial endpoints for campus zones, geocoding, reverse geocoding, road routing, and meteorological forecasting.

---

## 3. Geospatial & Meteorological Architecture

MOBILITY treats geographical location and trip context as first-class citizens across search, discovery, booking, and host onboarding.

### Supported Public Services & Providers

| Provider / Service | Role in MOBILITY | Auth / API Key | Policy, Rate Limits & Attribution Requirements |
|---|---|---|---|
| **CARTO Positron** | Primary vector tile aesthetic (clean, neutral high-contrast cartography). | None required. | Default: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`. Attribution: `© OpenStreetMap contributors, © CARTO`. Subdomains: `abcd`. |
| **OpenStreetMap Standard Tiles** | Dynamic tile fallback if CARTO experiences connectivity or CORS issues. | None required. | Standard OSM tile policy; attribution: `© OpenStreetMap contributors`. |
| **OpenRouteService** | Primary turn-by-turn road routing, vehicle profiling (driving-car vs. cycling-regular), alternative corridors. | Optional (`OPENROUTESERVICE_API_KEY`). | Free tier: 2,000 requests/day. If unconfigured or quota reached, automatically falls back to secondary provider. |
| **OSRM (Open Source Routing Machine)** | Secondary road routing engine for distance and duration. | None required (uses demo server or self-hosted endpoint). | Configurable via `OSRM_ROUTING_URL`. ODbL 1.0 license. Note: Public demo server is strictly for prototyping/low-volume fair use. |
| **Calibrated Campus Road Model** | Offline third-tier fallback providing resilient road distance estimations. | None (local execution). | Calibrated with a 1.28× road curvature factor and speed profiling (24 km/h for 2W, 28 km/h for 4W). **Explicitly labelled as Estimated Route.** |
| **OpenStreetMap Nominatim** | Address geocoding and reverse geocoding with nearest campus zone awareness. | None required. | Strictly enforces OpenStreetMap's 1 req/sec policy using a sequential promise queue and custom identifying User-Agent. |
| **OpenCage** | Optional enterprise-grade forward and reverse geocoding. | Optional (`OPENCAGE_API_KEY`). | Free tier: 2,500 requests/day. When configured, takes priority over Nominatim. |
| **Open-Meteo** | Live temperature, weather condition code translation, precipitation probability, and vehicle-specific advisories. | None required. | Free for non-commercial use up to 10,000 requests/day per IP; CC BY 4.0 license. Cached for 15 minutes. |

---

## 4. Production-Hardening & Security Controls

### A. Route Classification (Actual vs. Estimated)
To prevent misleading users, MOBILITY strictly distinguishes route results:
- **`actual` Road Route:** Generated from live road network APIs (OpenRouteService or OSRM). Indicated on the UI with a green `✓ Actual Road Route` badge.
- **`estimated` Campus Route:** Generated when external routing servers are unreachable, applying local campus road topology with 1.28× tortuosity curvature. Indicated on the UI with a yellow `⚠ Estimated Route` badge, prefixed distance `~X.X km (Estimated)`, and an explanatory note.
- **`unavailable` Route:** Gracefully flagged if coordinates are invalid or out-of-bounds, preventing application crashes.

### B. Nominatim Usage Policy & Rate-Limiting
- **Sequential Queue (`lib/server/geo-cache.ts`):** All outgoing Nominatim requests pass through a FIFO promise queue enforcing a minimum interval of 1,100ms between calls. This guarantees strict single-process compliance with OpenStreetMap's 1 req/sec rule even under burst concurrency.
- **Configurable Identity:** Supports `NOMINATIM_EMAIL` and `NOMINATIM_USER_AGENT` to comply with OpenStreetMap's contact header requirement.
- **Multi-Instance / Serverless Consideration:** In distributed multi-container or serverless deployments with multiple isolated Node processes, in-memory rate limiting does not coordinate across instances. For multi-instance production, configure `OPENCAGE_API_KEY` (commercial tier) or implement a centralized Redis token bucket.

### C. SSRF Guard & Host Allowlist (`lib/server/ssrf-guard.ts`)
All server-side fetch requests (`secureUpstreamFetch`) validate destination URLs against a strict allowlist of sanctioned geospatial hosts:
- `api.openrouteservice.org`
- `router.project-osrm.org`
- `nominatim.openstreetmap.org`
- `api.opencagedata.com`
- `api.open-meteo.com`
- `*.basemaps.cartocdn.com`
- `*.openstreetmap.org`
Requests to internal addresses (`169.254.169.254`, `localhost`, `127.0.0.1`) or unapproved external domains are blocked before dispatch.

### D. Booking Route Telemetry Integrity
When a booking is created via `/api/bookings`:
- Drop-off coordinates (`dropoffLat`, `dropoffLng`) are validated with `isValidCoordinate`.
- Route distance (`routeDistanceKm`) and estimated travel time (`estimatedDurationMins`) are boundary-checked.
- Route metrics are persisted for trip receipts and return station logistics, but financial pricing calculations are computed authoritatively on the server based solely on daily rates, rental days, and statutory taxes.

---

## 5. Predefined Campus Zones Gazetteer

The platform ships with a catalog of verified campus hubs across 6 major academic centers in India (`lib/campus-zones.ts`):

- **Chennai:** IIT Madras North Gate (Transit Hub), South Gate (IITM Research Park), Hostel Zone (Mandakini Quad).
- **Bengaluru:** IISc Central Administrative Ring, Student Quarters (Hostel Block D), Tech Innovation Gate 2.
- **Kochi:** CUSAT West Campus Promenade, University Central Library Hub.
- **Coimbatore:** Library Approach / Tech Park Terminal, Student Quarter / Hostel Area.
- **Hyderabad:** IIIT-H / HCU Main Gate (Gachibowli Edge), Bakul / Parijaat Hostel Concourse.
- **Mumbai:** IIT Bombay Powai Main Gate, Hostel 12-14 Concourse.

Every location has verified GPS coordinates and supports automatic nearest-zone resolution within 3 km.

---

## 6. Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
# =============================================================================
# MOBILITY CONFIGURATION
# =============================================================================

# AI Studio features
GEMINI_API_KEY="your_api_key_here"
APP_URL="http://localhost:3000"

# Optional: Map Tiles (Default: CARTO Positron)
NEXT_PUBLIC_MAP_TILE_URL="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
NEXT_PUBLIC_MAP_ATTRIBUTION="&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener\">OpenStreetMap</a> contributors, &copy; <a href=\"https://carto.com/attributions\" target=\"_blank\" rel=\"noopener\">CARTO</a>"

# Optional: OpenRouteService Directions API (2,000 req/day free)
OPENROUTESERVICE_API_KEY=""

# Optional: Routing fallback provider ("osrm" or "none")
ROUTING_FALLBACK_PROVIDER="osrm"
OSRM_ROUTING_URL="https://router.project-osrm.org"

# Optional: OpenCage Geocoding API (2,500 req/day free)
OPENCAGE_API_KEY=""

# Nominatim compliance contact information
NOMINATIM_RATE_LIMIT_MS="1100"
NOMINATIM_EMAIL="contact@mobility-campus.local"
NOMINATIM_USER_AGENT=""
```

---

## 7. Verification & Testing

```bash
# Run comprehensive automated test suite (19 unit/integration tests)
npm test

# Run TypeScript static type verification
npm run typecheck

# Run ESLint codebase verification
npm run lint

# Run production build (webpack target)
npm run build
```

---

## 8. Remaining Production Limitations

1. **Self-Hosted Routing for High Concurrency:** The public OSRM server is a community-supported demo endpoint subject to fair-use throttles. Production deployments handling continuous turn-by-turn routing should provision a private OSRM instance or maintain an active OpenRouteService commercial plan.
2. **Distributed Rate Limiting:** The built-in sequential queue coordinates rate limits on a per-process basis. Deployments on multi-instance serverless platforms (such as AWS Lambda or Vercel Edge with dozens of concurrent lambdas) should back Nominatim queries with a distributed Redis queue or rely on an OpenCage key.
3. **Payment Gateways:** Financial checkouts currently record demonstration bookings with mock references. A production deployment requires connecting a Razorpay or Stripe webhook endpoint.
