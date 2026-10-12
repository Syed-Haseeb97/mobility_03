# MOBILITY — Production Vehicle Rental Marketplace

> **Campus & Urban Two-Wheeler & Passenger Vehicle Rental Exchange**  
> *"YOUR CAMPUS, IN MOTION"*

---

## 1. Project Overview & Architecture

Mobility is a fully functional, production-ready vehicle rental marketplace engineered for college campuses, tech parks, and urban transit edges. It connects student and faculty renters with authorized vehicle owners and commercial fleet operators.

### Key Highlights
- **Formal Automotive Identity:** Replaced all sensationalist and informal toy gimmicks (such as *"mileage king"*, burnout animations, wheelie simulations, and synthesizer horns) with an executive, institutional inspection studio featuring 3D perspective parallax, technical dimension sheets, and regulatory verification status.
- **Dynamic Owner-Authored Listings:** Every listing features descriptions, pickup guidelines, and usage terms written directly by the host who lists the vehicle for rent.
- **Persistent Backend & Database:** Backed by server-side atomic persistence (`data/mobility-store.json`), supporting real multi-user state, booking concurrency locks, and financial ledgers.
- **Three Authenticated Application Roles:**
  - **Customer / Renter:** Discover vehicles by campus zone, inspect documents, calculate authoritative rental rates, provide Driving License (DL), reserve with concurrency protection, access itemized tax invoices, and rate trips.
  - **Vehicle Owner / Rental Partner:** Comprehensive 3-step listing builder, live preview, garage management, key handover digital checklist (odometer, fuel level, helmet issue), return check-in with deposit release, revenue tracking (10% platform fee), and automated settlement requests.
  - **Platform Administrator:** Central operations portal to audit listings, approve/suspend vehicles, verify driver KYC credentials, oversee active campus trips, and manage payouts.

---

## 2. Application Roles & Capabilities

| Capability | Customer | Vehicle Owner | Administrator |
|---|:---:|:---:|:---:|
| **Browse & Filter Vehicles** | ✓ | ✓ | ✓ |
| **Inspect RC & Commercial Insurance** | ✓ | ✓ | ✓ |
| **Book with Concurrency Protection** | ✓ | — | Manual override |
| **Download Tax Invoice / Receipt** | ✓ | — | Audit access |
| **Submit Ride Reviews** | ✓ | — | Moderation |
| **List Vehicle with Custom Description** | — | ✓ | Approval queue |
| **Key Handover & Return Checklist** | — | ✓ | Audit log |
| **Earnings Ledger & Disbursal Requests** | — | ✓ | Settlement dispatch |
| **KYC Credential Authentication** | Submit DL | Submit KYC | Approve / Revoke |

---

## 3. Technology Stack

- **Framework:** Next.js 15 (App Router, Server Actions & API Routes)
- **UI & State:** React 19, TypeScript 5.8
- **Styling:** Tailwind CSS v4, PostCSS, Custom DM Mono & Manrope Typography
- **Graphics & 3D Parallax:** Three.js, Lucide Icons
- **Persistence:** Server-side atomic JSON database store (`lib/server/db.ts`) with concurrency checking

---

## 4. Getting Started Locally

```bash
# 1. Install dependencies
npm install

# 2. Type-check & Build
npm run typecheck
npm run build

# 3. Start production server
npm start
# OR launch local development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 5. Main Route Directory

- `/` — Homepage featuring the 3D Vehicle Fleet Inspector, full-viewport showcase carousel, campus search panel, and curated verified inventory.
- `/rent` — Vehicle marketplace catalog with campus zone filter, vehicle type filter (2-Wheeler vs 4-Wheeler), category, and sort controls.
- `/rent/vehicle/[id]` — Detailed vehicle profile showing owner's custom written description, pickup bay coordinates, document verification badges, ISI helmet option, and authoritative checkout.
- `/rent/bookings` — Customer trips dashboard: upcoming rides, active journeys, completed trips, tax invoices / receipts, cancellation with automated refund calculation, and star reviews.
- `/host/dashboard` — Partner command center: live fleet stats, gross bookings, 10% platform commission, pending settlements, digital key handover desk, and disbursal requests.
- `/host/listings` — Partner garage management: view active listings, toggle pause/active status, and view live vehicle profiles.
- `/host/add-vehicle` — 3-step listing builder with custom host description editor, helmet arrangement, pricing, and real-time card preview.
- `/list-your-vehicle` — Partner program onboarding and operational architecture.
- `/guidelines` — Formal campus ground rules, student pre-departure checklist, partner hygiene standards, and verification evidence philosophy.
- `/admin` — Platform operations desk: vehicle moderation queue, KYC credential approvals, master booking ledger, and settlement disbursals.
- `/api/...` — REST endpoints for auth sessions, vehicle search & creation, bookings, handovers, reviews, payouts, and admin moderation.

---

## 6. Regulatory & Safety Standards

- **Registration Certificate (RC):** Cross-referenced against state transport database.
- **Commercial Insurance:** Comprehensive cover with third-party liability and roadside assistance.
- **Mandatory ISI Helmet Policy:** Every two-wheeler rental includes clean, sanitized, certified protective headgear.
- **Campus Speed Limits:** Strict 25 km/h campus perimeter speed adherence logged in rental guidelines.
