# MOBILITY

**Campus-first mobility marketplace** — discover bikes, scooters, electric rides, and cars for campus life and nearby trips.

MOBILITY is a Next.js/React prototype for a campus and local vehicle-rental marketplace. The interface supports public listing discovery and includes demo flows for renters, vehicle owners, and platform operations.

> **Production status: not ready to accept real bookings or payments.** The current repository uses demo identities and a local JSON store, and it does not integrate a real payment provider. Public production deployments fail closed for demo-only dashboards and write APIs until real authentication, authorization, persistence, and payments are configured.

## What the app includes

- Campus-first homepage with ride search, categories, featured approved listings, how-it-works steps, and an owner-partner CTA.
- Vehicle marketplace with text search, location/type filters, pricing filters, sorting, and date-based availability filtering.
- Vehicle detail and booking-request flow.
- Demo renter, owner, and admin views for exploring the intended workflow.
- Listing review status and document-verification flags.
- Responsive layouts and lightweight CSS animation that respects reduced-motion preferences.

## Tech stack

- Next.js 15 App Router
- React 19 and TypeScript
- Tailwind CSS v4 plus custom CSS
- Lucide icons
- Node filesystem JSON store for local/demo data

## Run locally

Requirements: Node.js compatible with Next.js 15 and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Before proposing changes, run the available checks:

```bash
npm run typecheck
npm run lint
npm run build
```

The scripts above are configured in `package.json`. A successful local build is necessary but does not replace a deployed end-to-end test.

## Demo mode and production safety

The identity selector in this prototype is a **demo persona switcher, not authentication**. It stores a selected user ID in the browser and must not be treated as proof of identity.

- In development, demo flows remain available.
- In a production build, `middleware.ts` blocks write APIs and demo-only booking, session, payout, review, dispute, admin, and host areas by default.
- The explicit overrides `MOBILITY_ENABLE_UNSAFE_DEMO_MODE=true` and `NEXT_PUBLIC_ENABLE_UNSAFE_DEMO_MODE=true` re-enable demo APIs and the demo navigation UI. Use them only in a private, isolated demonstration environment. **Do not enable them on a public deployment.**
- The committed data store contains synthetic sample users, listings, and booking records; do not treat them as real availability or payment history.
- Never put real identity documents, phone numbers, payment references, or payout details in the tracked demo store. Sanitizing the current file does not remove earlier values from Git history.
- New listings begin in `pending_review`; RC and insurance verification are not automatically asserted.
- Booking requests remain `PENDING` for payment. The application does not collect money, generate a real payment reference, issue refunds, or settle payouts.

The production guard is a safety boundary for this prototype, not a replacement for proper authentication and authorization. Before a public launch, integrate a real identity provider or secure session implementation and check user ownership/roles inside every sensitive route and data-access operation.

## Known production prerequisites

These must be completed and tested before accepting real users, vehicle documents, bookings, or money:

1. **Authentication and authorization:** server-managed sessions, secure cookies, role checks, and ownership checks for each route and mutation.
2. **Payments:** integrate a payment provider, verify signed webhooks server-side, use idempotency keys, and implement cancellation/refund/settlement reconciliation.
3. **Database:** replace filesystem JSON storage with a managed database and transactional availability constraints. The current store is for a single-instance demo and is not suitable for serverless or multi-instance production.
4. **Document verification:** implement a real review process and evidence audit trail before displaying verification badges or approving listings.
5. **Legal and operations:** confirm rental eligibility, insurance scope, local requirements, deposit/refund policy, terms, privacy policy, incident handling, and customer support with qualified advisers.
6. **Operational readiness:** add automated tests, rate limiting, request validation, monitoring, backups, recovery procedures, and a tested deployment pipeline.

## Important routes

- `/` — campus-first landing page
- `/rent` — vehicle discovery and filtering
- `/rent/vehicle/[id]` — listing detail and demo booking request
- `/rent/bookings` — demo renter dashboard
- `/host/dashboard`, `/host/listings`, `/host/add-vehicle` — demo owner tools
- `/admin` — demo operations console
- `/guidelines` — rental and safety guidance

## Design direction

The landing page leads with the mobility service and the renter's task—not a full-screen carousel of specific vehicle models. Its visual language combines a deep forest-green canvas, warm neutral surfaces, lime accents, restrained orbit/floating animations, direct search controls, and clear paths for renters and vehicle partners. Motion is decorative and reduced when the visitor requests reduced motion.

## Contribution workflow

Work on a feature branch, run type-check/lint/build checks, and review the diff before opening a pull request. Do not merge to `main` until the change has been reviewed and the required checks pass.
