# MOBILITY — Production Vehicle Rental Marketplace

> **Campus & Urban Two-Wheeler & Passenger Vehicle Rental Exchange**  
> *"YOUR CAMPUS, IN MOTION"*

---

## 1. Project Overview & Architecture

Mobility is a campus-first vehicle rental marketplace prototype for college campuses, tech parks, and urban transit edges. Production use requires configured authentication, authorization, payment processing, and operational verification. It connects student and faculty renters with authorized vehicle owners and commercial fleet operators.

### Key Highlights
- **Formal Automotive Identity:** Replaced all sensationalist and informal toy gimmicks (such as *"mileage king"*, burnout animations, wheelie simulations, and synthesizer horns) with an executive, institutional inspection studio featuring 3D perspective parallax, technical dimension sheets, and regulatory verification status.
- **Dynamic Owner-Authored Listings:** Every listing features descriptions, pickup guidelines, and usage terms written directly by the host who lists the vehicle for rent.
- **Prototype persistence:** Uses a server-side JSON store (`data/mobility-store.json`) for local demos. This is not a substitute for a transactional managed database in a multi-instance production deployment.
- **Three Prototype Application Roles:**
  - **Customer / Renter:** Discover vehicles by campus zone, review listing details, provide booking information, and explore the intended rental flow. The current booking flow is a demo and does not process real payments.
  - **Vehicle Owner / Rental Partner:** Listing builder, live preview, garage management, and prototype handover/return and earnings screens. Production access requires server-enforced owner authorization and a real settlement integration.
  - **Platform Administrator:** Prototype operations screens for listing review, KYC status, bookings, and payouts. Production access requires authenticated administrator authorization and auditable workflows.

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

- **Framework:** Next.js 16.4.0 (App Router, Server Actions & API Routes)
- **UI & State:** React 19, TypeScript 5.8
- **Styling:** Tailwind CSS v4, PostCSS, Custom DM Mono & Manrope Typography
- **Graphics & 3D Parallax:** Three.js, Lucide Icons
- **Persistence:** Local JSON prototype store (`lib/server/db.ts`); migrate to a transactional database before production

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

- `/` — Campus-first landing page with animated hero, date-aware search, vehicle categories, published listings, rental steps, and partner CTA.
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

## 6. Production readiness and demo limitations

- The local prototype supports persona switching and seeded records for demonstrations only; they are not real authentication or live inventory.
- Local development and preview deployments may use the seeded prototype store. An unconfigured Vercel production deployment is intentionally empty and blocks sensitive mutations until a real database, authentication/authorization, and required provider integrations are configured.
- `MOBILITY_DEMO_MODE=true` is an explicit opt-in for a public demo deployment that needs seeded inventory. It must not be used as the production configuration for a real rental service.
- Public production vehicle browsing exposes only approved listings. New vehicle listings start in `pending_review` and are not automatically marked as verified.
- Demo bookings do not process payment; a displayed booking or payment status must not be treated as a real financial transaction.
- Before a public launch, review every API route for authentication, role and resource ownership checks; migrate JSON storage to a transactional database; integrate a payment provider with verified webhooks/idempotency; and validate the actual RC/insurance evidence process.

## 7. Safety controls to implement and verify

The following are product requirements, not claims that MOBILITY has independently verified every vehicle or operator:

- **Registration and insurance:** Collect the relevant documents, validate them through an authorized process, record expiry dates, and show a review status only after evidence has been checked.
- **Helmets and handover:** Confirm the availability and condition of appropriate helmets at handover for two-wheelers; record the actual handover checklist.
- **Local rules:** Publish the applicable speed limits and campus rules only after confirmation with the relevant institution and local authorities.
- **Incident and refund handling:** Define real support, cancellation, dispute and refund procedures before accepting public bookings.
- **Privacy:** Restrict driving-license, contact, booking and financial data to the people and services that need it, using server-enforced authorization.

These controls must be operationally implemented and tested before MOBILITY is marketed as a fully verified or production-ready rental service.
