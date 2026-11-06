# CAFE PLATFORM — ALL-IN-ONE AI AGENT MASTER BRIEF

> This file combines the full product requirements, agent rules, design system, backend contract, implementation plan, and copy-ready agent prompts. For modular handoff, use the accompanying ZIP bundle.


---

<!-- SOURCE FILE: AGENTS.md -->

# AGENTS.md — Non-negotiable rules for all coding agents

## 1. Mission
Build a reliable, attractive cafe platform with five connected surfaces:
1. Public cafe website.
2. Mobile-first QR menu.
3. Online table-reservation flow.
4. Staff billing/POS application.
5. Password-protected admin panel/CMS.

The preferred stack is React + TypeScript on the frontend and Python on the backend. Keep the project understandable for a small team and maintainable by a future developer.

## 2. Source-of-truth hierarchy
When instructions conflict, follow this order:
1. Explicit user decisions made after this document.
2. `MASTER_PRODUCT_SPEC.md`.
3. `BACKEND_CONTRACT.md` for API/data behaviour.
4. `DESIGN_SYSTEM.md` for presentation.
5. `IMPLEMENTATION_PLAN.md` for sequencing.

Do not silently invent business decisions. Record unresolved decisions in `docs/OPEN_DECISIONS.md` and use safe configurable defaults.

## 3. Product and engineering guardrails
- Build a working system, not a static mockup. Buttons, links, forms, filters, and actions must work or be visibly marked as unavailable.
- Never show a reservation as confirmed until the backend has committed it and returned a confirmed state.
- Never report an order as paid until a recorded payment method/transaction has been committed successfully.
- Never calculate totals only in the browser. The backend must validate prices, quantities, taxes, discounts, and totals.
- Never trust prices, tax rates, user roles, order status, or booking availability supplied by the client.
- Use server-side validation for every write operation.
- Use integer minor currency units for money (e.g. paise for INR) or a carefully specified Decimal strategy. Never use binary floating-point for money.
- Store order-line snapshots of item name, SKU/code, unit price, tax classification/rate, quantity, and modifiers at the time of sale. Historical receipts must not change when the menu changes later.
- Use timezone-aware timestamps. Store UTC in the database and render in the cafe's configured timezone (`Asia/Kolkata` by default; editable in settings).
- Use migrations for schema changes. Never alter a live schema manually.
- Do not add real payment gateway, email/SMS provider, Google Maps key, or analytics until credentials/configuration are provided. Provide adapters and safe disabled states.
- Do not put secrets in source code, frontend variables, committed `.env` files, screenshots, or logs.
- Do not invent the cafe name, logo, address, phone, legal business details, GSTIN, tax rates, menu prices, table capacity, or booking policy. Use conspicuous demo placeholders and editable settings.
- Do not scrape or copy another cafe's protected visual identity, text, photography, or code. Borrow general layout principles only.

## 4. Local-first and public internet rules
- The local POS must run on the cafe computer and be reachable over the cafe's local Wi-Fi/LAN where configured.
- Local development defaults to FastAPI + SQLite. Use the same SQLAlchemy models and Alembic migrations for SQLite development and PostgreSQL deployment.
- A static React deployment does not make a local API public. `localhost` is the visitor's own device, not the cafe server.
- Real public booking requires a deployed HTTPS API and a persistent database reachable from the internet. If that has not been configured, show the booking feature as disabled/preview and do not claim a booking was made.
- Never deploy SQLite on an ephemeral free-host filesystem. Do not use Render Free filesystem for database files or customer uploads.
- Do not implement two-way local/cloud database replication in the first MVP. Keep deployment modes explicit. The first production mode should use one authoritative database. Offline POS writes may be queued locally and synced when connection returns, with idempotency keys.
- If the API is unreachable, preserve a draft/order in the local queue and show `Pending sync`, not `Paid`, `Confirmed`, or `Completed`.

## 5. Code quality rules
- Frontend: React, TypeScript strict mode, functional components, reusable UI primitives, React Router, TanStack Query for server data, React Hook Form + Zod for forms, and a small state store only where necessary.
- Backend: Python 3.11+ (or current stable supported version at implementation time), FastAPI, Pydantic, SQLAlchemy 2.x, Alembic, and PostgreSQL in hosted deployment.
- Use modular domain/service/repository boundaries. Keep HTTP route handlers thin.
- Use typed request/response schemas. Generate and maintain OpenAPI documentation.
- Use explicit loading, empty, success, validation-error, network-error, and permission-denied states.
- Use stable IDs, database constraints, foreign keys, indexes, uniqueness rules, and transactions where needed.
- Add structured logs without passwords, tokens, card data, or unnecessary personal data.
- Prefer small dependency sets. Explain every new major dependency in the pull-request/task summary.
- Use `ruff` and formatter/linter tooling for Python; ESLint and Prettier for TypeScript.
- Keep `.env.example` current. Validate configuration at startup and fail clearly for missing required production settings.

## 6. Security and privacy rules
- Use Argon2id or bcrypt password hashing; never store plaintext passwords.
- Admin/staff endpoints must enforce authentication and role permissions on the server.
- Prefer secure, HttpOnly, SameSite cookies for browser sessions; implement CSRF protection for cookie-authenticated mutations. If bearer tokens are used, document storage and threat tradeoffs.
- Add login rate limiting, booking endpoint abuse protection, input length limits, output encoding, CORS allowlists, secure headers, and audit logs for sensitive actions.
- A public booking form should collect only necessary details. Do not expose customer phone/email to public APIs.
- Do not store raw card numbers, CVV, UPI PINs, or payment credentials. Payment integration must use a hosted/tokenized provider flow when added.
- Configure backups and test restore before live operation. A backup that has never been restored is not a verified backup.

## 7. Collaboration rules for multiple agents
- The lead agent owns architecture, task assignment, integration, and final acceptance.
- Frontend and backend agents must agree on `BACKEND_CONTRACT.md` before implementing integration points.
- Do not let agents edit the same component, schema, or route concurrently. Assign clear file ownership.
- Every task must state: objective, allowed files, dependencies, acceptance criteria, and tests.
- Agents must not remove working features or change APIs without updating the contract and tests.
- Commit small logical changes. Never force-push or overwrite another agent's work.
- Before marking a task complete, run relevant tests and report exact commands and outcomes.

## 8. Definition of done
A feature is done only when:
- It works on the target viewport(s), including mobile where relevant.
- It has proper loading, empty, success, error, and permission states.
- Server-side validation and authorization are in place.
- Tests cover normal and important failure paths.
- No secret or personal data is leaked in logs or source.
- Documentation and `.env.example` are updated where required.
- A human can follow the documented steps to verify it.


---

<!-- SOURCE FILE: MASTER_PRODUCT_SPEC.md -->

# MASTER PRODUCT SPECIFICATION
## Cafe Website + QR Menu + Reservations + POS/Billing + Admin CMS

**Document status:** Build brief / MVP source of truth  
**Prepared:** 4 November 2026  
**Initial operating assumption:** one cafe, one location, local-first development and in-cafe POS; public website hosted on a free/low-cost static tier initially.  
**Currency/timezone defaults:** INR / `Asia/Kolkata`, both configurable.  
**Cafe name, logo, address, business/tax registration, menu, pricing and booking policies:** not yet supplied; do not invent.

---

## 1. Product vision

Create a cohesive cafe platform that lets customers discover the cafe, browse an attractive live menu, scan a table QR code, and request a reservation. Staff should use a fast, keyboard/touch-friendly POS to open tables, add items, calculate bills, record payments, and print or download receipts. Owners/managers should edit the website and menu without changing code.

The customer-facing site should feel like a carefully art-directed independent cafe, not a generic enterprise dashboard. The admin and POS should be practical, predictable, and fast during busy service.

## 2. Goals

- Replace a manually maintained menu PDF with a searchable, mobile-friendly HTML menu controlled from admin.
- Print one QR code per table or a general menu QR. A QR URL must remain stable if menu content changes.
- Accept public reservation requests once a public API is deployed and configured.
- Support walk-in, dine-in, takeaway, and counter sales through POS.
- Generate accurate receipts and end-of-day sales summaries.
- Let authorized staff change menu items, photos, prices, availability, opening hours, homepage content, and reservation settings.
- Keep local development simple and support a reliable local POS mode.
- Keep the architecture ready for hosted PostgreSQL without redesigning the whole application.

## 3. Non-goals for the first MVP

Do not build these unless separately approved:
- Multi-branch/franchise support.
- Full accounting, payroll, supplier procurement, or statutory tax filing.
- Loyalty points, marketing automation, customer segmentation, gift cards, or subscriptions.
- Native iOS/Android applications.
- Complex kitchen display system or printer hardware integrations beyond a basic print-friendly receipt.
- Real payment gateway integration before the owner supplies provider/account details.
- Automatic two-way replication between a local database and cloud database.
- AI-generated menu descriptions or prices without owner review.

## 4. Users and roles

| Role | Main permissions |
|---|---|
| Owner | Full access, settings, staff, menu, bookings, orders, reports, audit history, backup/export |
| Manager | Menu, bookings, orders, discounts within configured limits, reports, shifts; cannot change owner/security settings unless granted |
| Cashier | POS, orders, payments, receipts, shift open/close; limited customer information |
| Kitchen/Service (optional) | View active order tickets and update preparation status; no financial/settings access |
| Public customer | Browse website/menu and submit a reservation request; no admin access |

Enforce permissions on the backend, not merely by hiding frontend navigation.

## 5. Application surfaces and routes

### Public website
- `/` — homepage.
- `/menu` — full HTML menu.
- `/menu/:categorySlug` — optional category anchor/route.
- `/book` — reservation request page.
- `/about` — story/gallery (content managed in admin).
- `/contact` — location, opening hours, phone/social links.
- `/privacy` and `/terms` — editable legal content placeholders; owner/legal reviewer must approve before live use.

### QR menu
- `/m` — general QR menu.
- `/m/:tableCode` — menu with table context.
- Query/table context must not expose private table/order/customer information.
- If table ordering is enabled later, the menu may create a draft order tied to a validated table token. In MVP, QR is menu-first; ordering from QR is optional Phase 2.

### Staff application
- `/staff/login`
- `/pos` — POS/cashier.
- `/pos/orders/:id` — order detail.
- `/pos/receipt/:id` — print-friendly receipt.
- `/staff/bookings` — reservation diary/list.

### Admin application
- `/admin` — dashboard.
- `/admin/menu` — categories and item management.
- `/admin/menu/new`, `/admin/menu/:id` — create/edit item.
- `/admin/bookings` — booking list/calendar/detail.
- `/admin/orders` — order history.
- `/admin/tables` — table and QR management.
- `/admin/staff` — staff and roles.
- `/admin/reports` — sales, payment modes, popular items, tax summary (informational only until tax setup reviewed).
- `/admin/content` — hero, story, gallery, contact, opening hours, social links, announcements.
- `/admin/settings` — cafe profile, currency, timezone, taxes, discounts, service charge, receipt settings, booking settings.
- `/admin/audit` — sensitive action history.

## 6. Core customer journeys

### 6.1 Discover cafe
1. Customer opens the public website.
2. Within the first screen they can understand the cafe identity and find the menu, booking action, and location/hours.
3. Customer can open the HTML menu without downloading a PDF.
4. Location and contact links work on mobile.

### 6.2 Scan QR menu
1. Customer scans the table QR.
2. The route opens quickly on a phone without requiring an account or app install.
3. Menu shows categories, item names, short descriptions, clear prices, dietary/allergen notes when supplied, and availability.
4. Table label may be shown, but no private order or customer details are exposed.
5. If item is unavailable, the menu clearly labels it unavailable or hides it according to admin settings.

### 6.3 Public reservation
1. Customer selects date, time, party size, name, and one contact method; optional notes are length-limited.
2. Backend checks opening hours, lead time, party-size limits, blackout dates, slot capacity, and existing bookings in a transaction.
3. Reservation is created as `requested` or `confirmed` depending on the owner-configured confirmation policy.
4. The UI shows the exact status returned by the server and a reference code.
5. When booking service is not configured, the page must say online booking is temporarily unavailable and offer the cafe phone contact. Do not accept a request into a fake local-only state.

### 6.4 Staff dine-in/counter sale
1. Cashier signs in and starts/selects a shift if shift tracking is enabled.
2. Cashier chooses dine-in/table, takeaway, or counter order type.
3. Cashier searches/categories menu items, adds quantities/modifiers/notes, and sees a running subtotal.
4. Backend validates each item and price and calculates totals from current server-side rules.
5. Cashier applies an authorized discount if permitted.
6. Cashier records payment (cash/card/UPI/manual external terminal) or marks the order unpaid where allowed.
7. Receipt is generated with unique number, timestamp, items, quantities, prices, applicable taxes/charges/discounts, total, and payment mode.
8. Receipt can be printed with browser print or saved as PDF.

### 6.5 Edit menu/content
1. Authorized admin signs in.
2. Adds or edits category/item, images, descriptions, price, tax configuration, modifiers, and availability.
3. Preview is available before publish.
4. Publish updates the public website and QR menu from the same database/API.
5. Historical order receipts keep their line-item snapshots.

## 7. Functional requirements by module

### 7.1 Public cafe website
- Responsive and mobile-first.
- Hero with cafe name, short editable tagline, one or two clear CTAs (View Menu / Book a Table).
- Sections: featured menu items, story, gallery, opening hours, address/map link, contact, social links, footer.
- Use authentic owner-supplied photography when available; until then use clearly replaceable demo assets, not random hotlinked production images.
- Menu text must be rendered as accessible HTML; a downloadable/printable menu may be secondary.
- SEO: page title, description, canonical URL, Open Graph metadata, sitemap, robots file, semantic headings, local business structured data only when real details are supplied.
- Editable content should update without a code deployment where feasible.

### 7.2 QR menu
- General QR and per-table QR generation.
- QR encodes a stable public URL, not raw menu JSON.
- Admin can download a print-ready PNG/SVG and see a preview with table label.
- QR should continue working if the cafe changes prices or menu items.
- Mobile layout should prioritize readability, tap targets and low bandwidth.
- Categories, vegetarian/vegan/spicy indicators, allergen fields and availability labels are data-driven and only shown when configured.
- No forced customer login.

### 7.3 Reservation management
- Owner-configurable days/hours, closed dates, slot interval, maximum party size, booking horizon, minimum notice, table/seat capacity, and confirmation mode.
- Public form must display local timezone and clear cancellation/contact policy.
- Prevent overbooking with a transaction/locking or database-safe capacity check; a frontend-only availability check is not enough.
- Booking statuses: `requested`, `confirmed`, `seated`, `completed`, `cancelled`, `no_show`.
- Admin can confirm, decline, reschedule, cancel, add internal notes, and search/filter by date/status/name/reference.
- Avoid duplicate submissions with idempotency/request keys.
- No automatic SMS/email until provider credentials and consent wording are configured. Display on-screen confirmation and reference code in MVP.

### 7.4 POS / billing
- Fast search, category tabs, item cards/list, quantity controls, cart, order type, table selector, customer note, discount (role-controlled), payment selection and completion.
- Support multiple payment records on one order (split payment) only if included in the MVP sprint; otherwise track one payment method and defer split tender.
- Statuses: `draft`, `open`, `awaiting_payment`, `paid`, `cancelled`, `refunded` (refund workflow can be disabled until approved).
- Payment methods initially: `cash`, `upi_manual`, `card_terminal_manual`, `other`; these are staff-recorded tender types, not gateway integrations.
- Unique invoice/receipt numbering must be server-generated and concurrency-safe.
- Reprint receipt without duplicating the sale.
- Void/cancel/refund require permissions and audit reason.
- Support browser printing; use CSS `@media print`; avoid requiring specific printer hardware.
- Provide daily totals by payment method and order type.
- Tax/GST logic must be configurable but not assume a rate, inclusive/exclusive mode, HSN/SAC, GSTIN or legal invoice compliance. Use neutral labels until owner/CA configures it.

### 7.5 Menu and content admin
- CRUD categories and menu items.
- Fields: name, slug, short description, long description, image, SKU/code (optional), category, price, currency, availability, featured, display order, dietary flags, allergen notes, tax class, variants/modifiers.
- Soft-delete/archive rather than permanently deleting items referenced by historical orders.
- Bulk availability on/off and drag/reorder if practical.
- Image upload with type/size limits, validation, and storage adapter. In local mode save to a configured local media directory. In hosted mode use durable object storage; do not assume free app filesystem is persistent.
- Website content CMS for hero, about text, gallery, hours, address, map link, phone, email, social links, announcements and footer.

### 7.6 Admin dashboard and reports
- Today: gross sales, order count, average order value, bookings, pending bookings, payment mix.
- Date range filters.
- Best-selling items and category totals.
- Sales by order type and payment method.
- Export CSV for orders and bookings.
- Display timezone and data range in every report.
- Clearly distinguish gross sales, discounts, taxes/charges, refunds and net collected; document formulas.
- Avoid calling sales summaries audited accounting reports.

### 7.7 Staff and audit
- Create/disable staff accounts, assign roles, reset passwords.
- Audit actions: login attempts (summary only), menu price change, booking status change, discount, void/refund, settings changes, staff-role changes, data exports.
- Capture actor, action, timestamp, target entity, and safe before/after metadata where appropriate.

### 7.8 Backup and data export
- Local SQLite backup command and owner-triggered export.
- Provide restore instructions and a verification checklist.
- Export important business data in portable formats (CSV/JSON) and database dump where supported.
- Do not silently delete old backups; implement retention settings and warn when storage is unavailable.

## 8. Visual/UX direction

Use the detailed rules in `DESIGN_SYSTEM.md`. In brief: warm editorial cafe identity, cream/off-white surfaces, deep espresso text, a restrained herb/sage accent, large genuine food/interior imagery, strong typography, a simple navigation bar, clear buttons, readable HTML menu. Public pages should feel calm and welcoming. POS/admin should feel operational and dense enough to be useful without clutter.

## 9. Technical architecture

### Recommended stack

| Layer | Recommendation | Reason |
|---|---|---|
| Frontend | React + TypeScript + Vite | Familiar, fast local development, static production build |
| Styling | Tailwind CSS + accessible component primitives (e.g. shadcn/ui/Radix) | Consistent design tokens and reusable components |
| Routing/data | React Router + TanStack Query | Clear page structure and predictable API cache |
| Forms | React Hook Form + Zod | Typed client-side validation, paired with server validation |
| Offline client cache | IndexedDB via Dexie; PWA/service worker | Preserve local drafts/cache; support reconnect |
| Backend | Python FastAPI + Pydantic | Typed REST API and generated OpenAPI |
| ORM/migrations | SQLAlchemy 2.x + Alembic | Same domain models across local SQLite and hosted PostgreSQL |
| Local database | SQLite | No extra server needed for local development/POS pilot |
| Hosted database | PostgreSQL | Relational integrity, concurrent writes and reporting |
| Authentication | Secure cookie session or short-lived access tokens with refresh; Argon2id password hash | Staff login and role authorization |
| QR generation | `qrcode.react` or backend `qrcode` library | Printable table/menu codes |
| Backend tests | pytest + HTTPX/TestClient | Domain/API regression tests |
| Frontend tests | Vitest + React Testing Library | Component and workflow tests |
| End-to-end | Playwright | Browser tests for reservation, menu, POS and admin |

### Suggested deployment profiles

**Profile A — local development / in-cafe pilot**
- React PWA served locally or installed in the browser.
- FastAPI runs on the cafe PC (or a dedicated local machine) and is reachable over LAN only if intentionally configured.
- SQLite file is stored in a backed-up local data directory, not inside a temporary build folder.
- Staff POS works without public internet as long as the local server and LAN remain available.
- Public website may be deployed as a static preview, but public booking is disabled until an internet API exists.

**Profile B — public beta / online booking**
- Static React website deployed to a provider with terms suitable for commercial use (Cloudflare Pages is a candidate; verify current terms and limits). Do not assume Vercel Hobby is allowed for a commercial cafe; its terms restrict it to non-commercial personal use.
- FastAPI deployed as an internet-facing HTTPS service.
- PostgreSQL hosted separately or as a managed database.
- Configure allowed CORS origins, secure secrets, backups, monitoring and a real domain when available.
- Render Free can be used for testing only: it can sleep after idle, has ephemeral filesystem, and its Free Postgres expires after 30 days. Do not put live cafe records there.
- Supabase Free can be evaluated for a prototype database, but free projects have limits and can pause after inactivity; do not rely on it as the only record of business sales without backup and operational safeguards.

**Profile C — production operations**
- Use paid, persistent backend/database hosting or a professionally managed server.
- Configure automatic backups, tested restore, monitoring, HTTPS, staff access controls, and a documented incident process.
- POS online mode uses the authoritative API/database; offline browser queue preserves drafts/operations and syncs idempotently when reconnected.

### Critical local/public distinction
The public website is not able to reach the cafe computer's `localhost`. For actual customer reservations from the public internet, the backend and reservation database must be deployed publicly. A static frontend alone cannot securely persist reservations. Do not expose the cafe PC directly to the internet using router port forwarding as the default solution.

### Local-first offline behaviour
- Cache public menu assets/data for browsing after initial load.
- Persist POS draft/cart and pending operations in IndexedDB.
- Give each queued mutation a unique idempotency key.
- Show clear states: `Saved on this device`, `Pending sync`, `Synced`, `Sync failed — retry`.
- Never mark pending payment/reservation as completed/confirmed before server acknowledgement.
- Conflict rules must be explicit. A price changed while an item is in an offline cart must be revalidated on sync; staff must confirm any price difference.
- Do not build generic bidirectional SQLite↔Postgres sync in MVP. The first production model should have one authoritative database.

## 10. Suggested repository structure

```text
cafe-platform/
├── AGENTS.md
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml                 # optional local Postgres profile
├── apps/
│   └── web/
│       ├── public/
│       ├── src/
│       │   ├── app/                   # router, providers, route guards
│       │   ├── components/            # shared UI primitives
│       │   ├── features/
│       │   │   ├── public-site/
│       │   │   ├── menu/
│       │   │   ├── reservations/
│       │   │   ├── pos/
│       │   │   ├── admin/
│       │   │   ├── staff/
│       │   │   └── reports/
│       │   ├── lib/                   # API client, schemas, formatters
│       │   ├── offline/               # IndexedDB, outbox, sync state
│       │   ├── styles/
│       │   └── types/
│       ├── tests/
│       └── package.json
├── services/
│   └── api/
│       ├── app/
│       │   ├── api/v1/                # routers
│       │   ├── core/                  # config, security, permissions
│       │   ├── db/                    # engine, sessions, base
│       │   ├── models/                # SQLAlchemy entities
│       │   ├── schemas/               # Pydantic models
│       │   ├── repositories/          # database access
│       │   ├── services/              # business logic
│       │   ├── integrations/          # email, payments, storage adapters
│       │   └── main.py
│       ├── alembic/
│       ├── tests/
│       ├── requirements.txt or pyproject.toml
│       └── Dockerfile
├── docs/
│   ├── OPEN_DECISIONS.md
│   ├── RUN_LOCAL.md
│   ├── DEPLOYMENT.md
│   ├── BACKUP_RESTORE.md
│   └── API.md
└── scripts/
    ├── seed_demo_data.py
    ├── backup_db.py
    └── export_data.py
```

## 11. Core data entities

See `BACKEND_CONTRACT.md` for the fuller model. At minimum:
- `CafeProfile`, `SiteContent`, `OpeningHours`, `CafeSettings`
- `StaffUser`, `Role`, `AuditEvent`, `Shift`
- `MenuCategory`, `MenuItem`, `MenuModifierGroup`, `MenuModifierOption`
- `DiningTable`, `TableQrToken`
- `CustomerContact` (minimal fields), `Reservation`, `ReservationSlot/CapacityRule`, `BlackoutDate`
- `Order`, `OrderLine`, `OrderLineModifier`, `Payment`, `ReceiptSequence`
- `TaxRule`, `DiscountRule`
- `InventoryItem`, `RecipeComponent`, `InventoryMovement` (optional Phase 2)

Use foreign keys and soft archive where history needs to remain. Avoid storing redundant PII. Use indexed lookup fields for order number, receipt number, booking reference, status, date, and foreign keys.

## 12. API surface summary

All endpoints should be versioned under `/api/v1`. See `BACKEND_CONTRACT.md` for detailed semantics.

- Public: `GET /public/site`, `GET /public/menu`, `GET /public/menu/{slug}`, `GET /public/availability`, `POST /public/reservations`.
- Auth: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, password reset only when delivery provider is configured.
- Admin: CRUD menu/categories/content/tables/staff/settings; list/update reservations; dashboard/reports; audit list.
- POS: create/update order, add/remove line, recalculate totals, record payment, get receipt, cancel/void according to role.
- Health: `/health/live`, `/health/ready`.

Return consistent error objects with machine-readable `code`, safe `message`, and optional `field_errors`. Never expose stack traces or SQL details.

## 13. Configurable business rules

All values below must be editable/configurable rather than hardcoded:
- Cafe display name, legal name, contact details, address, timezone, currency.
- Opening hours and holiday/blackout dates.
- Booking slot interval, party limit, booking horizon, minimum notice, capacity, confirmation mode, cancellation rules.
- Menu pricing, item/category availability, modifiers, dietary/allergen notes.
- Tax classes/rates, inclusive/exclusive calculation, service charge, rounding policy, receipt labels and numbering.
- Discount types, limits and roles allowed to apply them.
- Payment methods accepted and whether unpaid orders can be completed.
- Logo, colors, typefaces, images, social links and footer/legal text.

Do not assume statutory tax settings. An Indian cafe may have GST obligations that depend on its registration and business details; owner/qualified tax professional must provide the applicable settings and approve invoice wording before live billing.

## 14. Initial demo data

Use obvious sample data only, and label it as demo:

**Categories**
- Coffee
- Tea & Other Drinks
- Breakfast
- Sandwiches & Small Plates
- Desserts

**Menu items** (demo only; currency INR)
- Espresso — ₹120
- Cappuccino — ₹160
- Iced Latte — ₹190
- Masala Chai — ₹90
- Veg Grilled Sandwich — ₹180
- Chocolate Brownie — ₹140

Do not treat sample prices, names, ingredients, allergens, tax classes, availability, or opening hours as real cafe data. Owner must replace them.

## 15. Acceptance criteria for MVP

### Public site/menu
- Homepage is responsive at 360px, 768px and desktop widths.
- Menu is real HTML backed by API data and shows empty/loading/error states.
- Menu edits in admin appear on public menu after save/publish without rebuilding the frontend.
- QR links open the intended general or table-scoped menu route.

### Reservation
- Valid reservation creates one database record and returns a reference/status.
- Invalid date, closed day, outside-hours request, over-capacity slot, and duplicate submission are rejected or handled according to configuration.
- Concurrent booking requests cannot exceed configured capacity.
- When public API is not configured, booking cannot report success.

### POS
- Staff can create a draft order, add/remove/edit quantities, calculate server-validated totals, record a payment method, and retrieve/reprint a receipt.
- Historical order line prices remain unchanged after menu price edits.
- Receipt number is unique under concurrent requests.
- Unauthorized staff cannot access owner-only functions.
- Offline/pending state is explicit and never misrepresented as paid.

### Admin
- Owner can manage categories, menu items, hours, site text and table QR labels.
- Staff roles are enforced on backend endpoints.
- Sensitive actions create audit events.

### Reliability/security
- Database migrations run from a clean database.
- Automated tests cover key services and API permission paths.
- Backup and restore are demonstrated on a clean local environment.
- Secrets are loaded from environment variables; `.env` is ignored by Git.
- No blocking console errors or unhandled failed network requests on core flows.

## 16. Launch checklist

Before public launch, owner must supply and approve:
- Cafe name, logo, brand assets and authentic photos.
- Public address, phone, email, map URL, opening hours, social URLs.
- Complete menu, prices, descriptions, availability, vegetarian/allergen information.
- Reservation capacity, rules, confirmation and cancellation policy.
- Legal business name, registration/tax details, invoice wording and tax configuration verified by qualified adviser.
- Payment methods and provider account details, if online payments are wanted.
- Hosting account, domain, data location preference, backup location and administrator contact.

Operational readiness:
- Set strong owner password and create individual staff accounts.
- Disable demo data and demo credentials.
- Configure HTTPS and CORS allowlist.
- Test booking from a phone outside cafe Wi-Fi.
- Test local POS with internet disconnected and document exact offline limits.
- Test receipt print on the intended printer/browser.
- Take a backup and complete a restore drill.
- Confirm host free-tier terms/limits are suitable; upgrade before relying on the system for business-critical transactions.


---

<!-- SOURCE FILE: DESIGN_SYSTEM.md -->

# DESIGN SYSTEM — Cafe Platform

## 1. Creative direction

**Direction:** contemporary neighbourhood cafe with a warm editorial identity. The result should feel premium, calm, tactile and inviting — not like a restaurant-chain template or a generic SaaS landing page.

**Reference principles:**
- Use the compact, scrollable information architecture described in [Superboosted Design's cafe website guide](https://www.superboosted.design/guides/best-cafe-website-examples): customers should quickly find the menu, hours, location and contact details.
- Use [Oak Hill Café & Farm](https://oakhillcafe.webflow.io/) as one visual reference for the prominent reservation CTA, image-led first impression, and clear hours/location treatment. Do not copy its identity or assets.
- Prefer actual cafe and dish photography supplied by the owner. Replace all demo photos before launch.

## 2. Design tokens

Treat these as a starting theme, not fixed brand facts. Define CSS variables/tailwind tokens so the owner can change the theme centrally.

| Token | Suggested value | Use |
|---|---|---|
| `--color-espresso` | `#25231F` | Main text, dark footer, strong buttons |
| `--color-cream` | `#F7F3EB` | Main page background |
| `--color-paper` | `#FFFEFA` | Cards, menus, forms |
| `--color-sage` | `#77856B` | Primary accent, badges, subtle links |
| `--color-sage-dark` | `#53634B` | Hover/active accent |
| `--color-clay` | `#B87555` | Occasional warm highlight |
| `--color-muted` | `#77736C` | Secondary text |
| `--color-line` | `#E4DED3` | Borders/dividers |
| `--color-success` | `#28734B` | Success state only |
| `--color-warning` | `#9A5B14` | Warning state only |
| `--color-danger` | `#B33B32` | Destructive/error state only |

**Typography**
- Display/headings: `DM Serif Display`, `Cormorant Garamond`, or an equivalent expressive serif.
- UI/body: `Inter`, `Manrope`, or a clean system sans-serif.
- Use a system-font fallback if remote fonts are unavailable.
- Avoid too many weights. Use clear hierarchy and generous line height.

**Shape and spacing**
- Use 8px-based spacing increments.
- Public cards: 12–18px radius; buttons: 999px pill only for major public CTA if it suits the brand; admin controls: 8–10px radius.
- Thin borders, restrained shadows, generous whitespace.
- Avoid excessive blur/glassmorphism, neon gradients, oversized rounded dashboard cards, and decorative animation.

## 3. Public website layout

### Desktop homepage wireframe

```text
┌──────────────────────────────────────────────────────────────────────┐
│ LOGO / CAFE NAME       MENU   OUR STORY   VISIT US   [BOOK A TABLE]  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Small eyebrow                                                        │
│  A thoughtful headline          LARGE AUTHENTIC CAFE / FOOD PHOTO    │
│  Short welcoming description                                          │
│  [EXPLORE MENU] [BOOK A TABLE]                                        │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  A LITTLE SOMETHING FOR EVERY MOOD                                    │
│  Featured menu cards (image, name, short detail, price)               │
├──────────────────────────────────────────────────────────────────────┤
│  MENU PREVIEW                 [VIEW FULL MENU]                        │
│  Category tabs + readable item rows                                   │
├──────────────────────────────────────────────────────────────────────┤
│  OUR STORY                   AUTHENTIC INTERIOR / PEOPLE PHOTO         │
├──────────────────────────────────────────────────────────────────────┤
│  VISIT US: HOURS | ADDRESS | MAP LINK | PHONE                         │
├──────────────────────────────────────────────────────────────────────┤
│  GALLERY / SOCIAL LINKS                                                │
├──────────────────────────────────────────────────────────────────────┤
│  Footer: cafe identity, menu, contact, policies, social               │
└──────────────────────────────────────────────────────────────────────┘
```

### Public homepage rules
- Keep the top navigation simple. On mobile, collapse into a clear menu drawer or compact nav.
- First screen: identity, one concise message, strong image, menu CTA and booking CTA.
- Show actual opening hours and address in a prominent visit section; don't bury them.
- Menu should be readable HTML, not a PDF-only menu.
- Buttons must have clear labels and adequate contrast.
- Add tasteful motion only for small transitions; respect `prefers-reduced-motion`.
- Use responsive image sizes and lazy-load below-the-fold gallery images.

## 4. QR menu layout

**Mobile-first target:** 360–430px viewport.

```text
┌────────────────────────────────┐
│ CAFE NAME                 MENU │
│ Table 08 (only if table QR)     │
│                                │
│ [Search menu................]  │
│ [Coffee] [Tea] [Food] [Sweets] │
│                                │
│ FEATURED                        │
│ ┌────────────────────────────┐ │
│ │ Item photo                 │ │
│ │ Cappuccino          ₹160   │ │
│ │ Short description          │ │
│ │ Veg / allergen notes       │ │
│ └────────────────────────────┘ │
│                                │
│ COFFEE                         │
│ Espresso                ₹120   │
│ Short description              │
│ ────────────────────────────── │
│ Latte                   ₹180   │
│ Short description              │
│                                │
│ Hours • Address • Call         │
└────────────────────────────────┘
```

- No login wall, no horizontal scrolling.
- Search and category chips should remain usable with a thumb.
- Price should be visually easy to scan and consistently formatted.
- Keep descriptions short and optional; avoid overcrowding.
- Show allergen/dietary information only when supplied and verified by the owner.
- Make unavailable items unmistakable.
- QR/table context must be safe to display publicly; never expose order history or customer data.

## 5. Booking UX

- Use a short, stepwise form if it improves mobile usability: date/time/party size, then contact details.
- Explain that a booking is a request until backend policy confirms it.
- Show local timezone, opening/closed days, cancellation instructions and contact fallback.
- Validation should be inline and specific; preserve user input after recoverable errors.
- Confirmation screen must display server-returned status and reference code.
- When booking API is disabled, show a graceful disabled state with phone/contact CTA instead of a dead form.

## 6. Admin design

**Direction:** clean operational workspace. Prioritize information hierarchy, readable tables, predictable forms and clear actions over marketing visuals.

### Admin shell
- Left sidebar: Dashboard, POS, Menu, Bookings, Orders, Tables & QR, Reports, Content, Staff, Settings.
- Top bar: page title, date/context, sync/network status, current staff and sign out.
- Main content: page-specific tables, forms and summary sections.
- Sidebar collapses on tablets/mobile; mobile POS can use bottom navigation or an accessible drawer.

### Admin page rules
- Lists need search, filters, sorting, pagination, empty states and clear row actions.
- Edit forms use labels, help text, validation and save/cancel actions.
- Destructive actions require confirmation and an audit reason where applicable.
- Unsaved changes must be indicated; prevent accidental navigation loss.
- Never use color as the only status signal; pair color with text/icon.
- Tables must remain usable on narrow viewports; use responsive cards or horizontal overflow with clear affordance.

## 7. POS design

**Speed and reliability are more important than decoration.**

Desktop layout concept:
- Left/main area: category tabs and searchable product grid/list.
- Right side: persistent cart with item rows, quantity controls, note/modifier, subtotal, discount and total.
- Bottom/right: order type, table selector, payment method and primary complete action.
- Large touch targets (minimum 44×44 CSS px), keyboard shortcuts only when documented and not conflicting with accessibility.
- Make network state and pending sync visible at all times.
- Clearly distinguish draft, unpaid, paid, voided and refunded orders.
- Confirmation before void/refund/discount above configured limit.

## 8. Component inventory

Build reusable components, at minimum:
- `SiteHeader`, `MobileNav`, `HeroSection`, `FeaturedItemCard`, `MenuCategoryTabs`, `MenuItemRow`, `MenuItemCard`, `OpeningHours`, `LocationBlock`, `SiteFooter`.
- `BookingForm`, `AvailabilityPicker`, `BookingStatusBadge`, `BookingDetailPanel`.
- `AdminShell`, `SidebarNav`, `PageHeader`, `DataTable`, `FilterBar`, `EmptyState`, `ConfirmDialog`, `FormField`, `ImageUploader`, `StatusBadge`, `Toast/InlineAlert`.
- `POSLayout`, `POSCategoryNav`, `ProductSearch`, `ProductTile`, `CartPanel`, `CartLine`, `OrderSummary`, `PaymentSelector`, `ReceiptPreview`, `SyncStatus`.

## 9. Accessibility and responsive requirements

- Target WCAG 2.2 AA as a design goal.
- Semantic HTML landmarks and heading order.
- Visible keyboard focus; complete keyboard navigation for menus/dialogs/forms/tables.
- Inputs have visible labels; errors are associated with inputs and announced appropriately.
- Contrast must be checked for all text, including muted text and badges.
- Provide alt text for meaningful images; decorative images use empty alt.
- Respect reduced-motion and browser zoom.
- Test at 360px, 390px, 768px, 1024px, 1440px widths.
- Do not rely on hover for essential mobile functionality.

## 10. Content and imagery rules

- Use editable placeholder copy until cafe details are supplied.
- Do not generate false claims such as organic, locally sourced, award-winning, allergen-free, vegan, or gluten-free.
- Do not use placeholder address/phone as if real.
- Any sample menu item or price must be visibly marked demo in development.
- Use licensed, owner-supplied or permitted assets; record source/licence for stock imagery.

## 11. Design acceptance checklist

- Homepage communicates cafe identity and the next action within a few seconds.
- Menu and visit details are easy to reach on mobile.
- QR menu needs no app installation or account.
- Admin can update content without code changes.
- POS can be operated with mouse/touch and keyboard.
- Focus states, validation, error messages and contrast are usable.
- Layout remains stable when images are missing or API is offline.


---

<!-- SOURCE FILE: BACKEND_CONTRACT.md -->

# BACKEND CONTRACT — Domain, API, and business rules

## 1. Backend conventions

- Base path: `/api/v1`.
- JSON request/response, UTF-8.
- Use UUIDs or opaque IDs for public-facing references; never expose sequential primary keys as security tokens.
- Use database transactions for order completion, receipt numbering, booking capacity reservation and audit events.
- Use UTC timestamps in storage; localize to cafe timezone for display.
- Money: integer minor units (e.g. INR 100 paise = ₹1.00) plus explicit `currency_code`. Do not use float.
- Pagination: cursor or page/limit with a maximum page size.
- Standard error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "field_errors": {"phone": "Enter a valid phone number."},
    "request_id": "opaque-request-id"
  }
}
```

Do not expose stack traces, SQL, internal host paths, secrets or PII in errors.

## 2. Core entities and suggested fields

This is a domain contract, not a command to put every field in one table. Agents should normalize the schema where appropriate and document deviations.

### Cafe and site
- `cafe_profile`: `id`, `display_name`, `legal_name` (nullable), `tagline`, `logo_asset_id`, `phone`, `email`, `address_text`, `map_url`, `timezone`, `currency_code`, `created_at`, `updated_at`.
- `site_content`: `key`, `json_value`, `published_at`, `updated_by` — or normalized page/section tables. Use a schema that is validated and versionable.
- `opening_hours`: `weekday`, `opens_at`, `closes_at`, `is_closed`; support split shifts if needed.
- `cafe_settings`: booking, tax, receipt, discount and operational settings with typed validation.

### Staff and security
- `staff_user`: `id`, `name`, `username/email`, `password_hash`, `role_id`, `is_active`, `created_at`, `last_login_at`.
- `role`: `id`, `name`, permissions or a fixed role enum plus permission map.
- `audit_event`: `id`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `safe_metadata_json`, `created_at`, `request_id`.
- `staff_session` if using server-managed sessions.
- `shift`: `id`, `opened_by`, `opened_at`, `opening_cash_minor`, `closed_by`, `closed_at`, `closing_cash_minor`, `status`.

### Menu
- `menu_category`: `id`, `name`, `slug`, `description`, `display_order`, `is_active`.
- `menu_item`: `id`, `category_id`, `name`, `slug`, `description`, `image_asset_id`, `sku`, `price_minor`, `currency_code`, `tax_class_id`, `is_available`, `is_featured`, `display_order`, dietary flags, allergen notes, `archived_at`.
- `modifier_group`: `id`, `name`, `min_select`, `max_select`, `is_required`.
- `modifier_option`: `id`, `group_id`, `name`, `price_delta_minor`, `is_available`.
- `menu_item_modifier_group`: association table.
- Menu items referenced by orders must be archived, not hard-deleted.

### Tables and QR
- `dining_table`: `id`, `label`, `capacity`, `is_active`, `display_order`.
- `table_qr_token`: `id`, `table_id`, `public_token` (random, revocable), `created_at`, `revoked_at`.
- Public QR route contains a random opaque token or table slug; never use the table database ID as authorization.

### Reservations
- `reservation`: `id`, `public_reference`, `customer_name`, `phone`/`email` (at least one configured contact route), `party_size`, `starts_at_utc`, `ends_at_utc`, `status`, `customer_note`, `internal_note`, `source`, `created_at`, `updated_at`, `created_by` nullable.
- `reservation_capacity_rule`: day/time capacity or table/seat capacity; document the capacity algorithm.
- `blackout_date`: `date`, `reason`, `is_closed`.
- Optional `reservation_table_assignment` if assigning actual tables in MVP.
- Index on date/time, status and reference. Do not return contact details from public availability endpoints.

### Orders and billing
- `order`: `id`, `order_number`, `order_type` (`dine_in`, `takeaway`, `counter`), `table_id` nullable, `reservation_id` nullable, `status`, `currency_code`, `subtotal_minor`, `discount_minor`, `tax_minor`, `service_charge_minor`, `rounding_minor`, `grand_total_minor`, `amount_paid_minor`, `created_by`, `shift_id`, `created_at`, `paid_at`, `cancelled_at`.
- `order_line`: `id`, `order_id`, `menu_item_id` nullable, `item_name_snapshot`, `sku_snapshot`, `unit_price_minor_snapshot`, `quantity`, `line_subtotal_minor`, `tax_class_snapshot`, `tax_rate_snapshot`, `tax_minor`, `notes`, `created_at`.
- `order_line_modifier`: snapshot of modifier name and price at sale time.
- `payment`: `id`, `order_id`, `method`, `amount_minor`, `status`, `external_reference` nullable, `recorded_by`, `created_at`, `refunded_at` nullable. `method` can include cash/manual UPI/manual card terminal/other.
- `receipt_sequence`: concurrency-safe sequence keyed by date/terminal/series as configured.
- `tax_rule`: name, rate basis points or Decimal string, inclusive/exclusive flag, effective dates, tax code/label; no default statutory rate.
- `discount_rule`: type, value, max amount, allowed roles, active window.

### Optional inventory (Phase 2)
- `inventory_item`, `recipe_component`, `inventory_movement`, `supplier` (only if procurement is later approved).
- Stock deduction should happen transactionally when an order reaches the configured committed state; void/refund reversal rules must be designed and tested.

## 3. API outline

### Public site and menu
- `GET /public/site` — published public site settings/content only.
- `GET /public/menu` — active categories and available items.
- `GET /public/menu/{category_slug}` — category details/items.
- `GET /public/menu/table/{public_token}` — menu plus safe table context.
- `GET /public/opening-hours`.

### Public booking
- `GET /public/availability?date=YYYY-MM-DD&party_size=2` — returns available slots only, no customer data.
- `POST /public/reservations` — creates one reservation request. Require rate limit and idempotency key.
- `GET /public/reservations/{public_reference}/status` — only if a secure verification mechanism is designed; a reference code alone should not expose personal data.

### Authentication/staff
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/password/change`
- `POST /auth/password/reset` only when a verified email/SMS delivery provider is configured.

### Menu/admin/content
- `GET/POST /admin/menu/categories`
- `PATCH/DELETE /admin/menu/categories/{id}` (delete means archive/deactivate if referenced)
- `GET/POST /admin/menu/items`
- `GET/PATCH/DELETE /admin/menu/items/{id}` (soft archive)
- `POST /admin/assets` — validated upload adapter.
- `GET/PATCH /admin/site-content`
- `GET/PATCH /admin/settings`

### Reservations/admin
- `GET /admin/reservations?from=&to=&status=`
- `GET /admin/reservations/{id}`
- `PATCH /admin/reservations/{id}` — status, schedule, internal note; log important changes.
- `GET/PUT /admin/booking-settings`
- `GET/POST/PATCH /admin/tables`
- `POST /admin/tables/{id}/qr/regenerate` — revokes old token and creates a new one.

### POS/orders
- `POST /pos/orders` — create draft/open order.
- `GET /pos/orders/{id}`
- `PATCH /pos/orders/{id}` — order type/table/note; enforce allowed status transitions.
- `POST /pos/orders/{id}/lines` — add line; backend resolves current item price.
- `PATCH /pos/orders/{id}/lines/{line_id}` — change quantity/modifiers/notes.
- `DELETE /pos/orders/{id}/lines/{line_id}` — remove while order is editable.
- `POST /pos/orders/{id}/recalculate` — returns server-computed totals.
- `POST /pos/orders/{id}/payments` — record tender; must be idempotent and atomic with order state transition.
- `POST /pos/orders/{id}/cancel` — permission + reason + audit event.
- `GET /pos/orders/{id}/receipt` — print-friendly receipt data or PDF adapter.
- `GET /pos/orders` — filtered order history.

### Reports/staff/audit
- `GET /admin/dashboard?date=`
- `GET /admin/reports/sales?from=&to=&group_by=`
- `GET /admin/reports/items?from=&to=`
- `GET /admin/reports/payments?from=&to=`
- `GET /admin/staff`; `POST /admin/staff`; `PATCH /admin/staff/{id}`
- `GET /admin/audit?from=&to=&actor=`
- `GET /health/live`; `GET /health/ready`

## 4. Important business rules

### Reservation capacity
- Validate cafe opening hours and blackout dates on the server.
- Validate party size, lead time and booking horizon.
- Prevent over-capacity under concurrency. A read-then-insert without transaction/locking is not sufficient.
- Define slot duration and buffer rules in settings.
- A request is `requested` unless auto-confirm is explicitly enabled and capacity is successfully committed.
- `requested` is not the same as `confirmed`.

### Order and receipt integrity
- Recalculate totals server-side from current trusted menu data and configured tax/discount rules.
- Store item/price/tax snapshots on each line at order time.
- Use database transaction for payment insert, amount-paid update, paid status and receipt sequence.
- Prevent overpayment unless split/advance payment behaviour is explicitly supported.
- Idempotency key prevents double payment capture/recording from retries.
- Void/refund is a new audited action; do not delete the original order/payment history.
- Receipt reprint must not create another sale.

### Tax/charges
- Tax configuration must support inclusive/exclusive modes and effective dates, but no jurisdiction rate should be assumed.
- Tax/charge calculation and rounding policy must be documented and unit-tested.
- Do not label a receipt as a legally compliant tax invoice until the owner supplies verified registration details and receives professional approval.

### Offline/outbox
- Every offline mutation has `idempotency_key`, `client_created_at`, entity reference and payload version.
- Server stores processed idempotency keys and response for safe retry.
- On sync, server revalidates menu price, availability and staff permissions.
- If a menu item price or availability changed, return a conflict requiring cashier review.
- UI displays `Pending sync` until server acknowledges.
- No silent overwrite of conflicting records.

## 5. Security and operational requirements

- Public routes are read-only except reservation submission; aggressively limit booking submissions.
- Admin/POS APIs require role checks on every endpoint.
- CORS allowlist must contain exact deployed website origins.
- HTTPS required in hosted deployment.
- Secrets only in environment variables/secret manager.
- Password hash Argon2id or bcrypt.
- Cookie sessions: HttpOnly, Secure in production, SameSite configured; CSRF token for mutations.
- Rate limit login, password reset, reservation submissions, asset uploads.
- Limit asset MIME type and file size; rename to generated identifiers; scan where available.
- Database constraints and transactions protect unique receipt numbers, references, and capacity.
- Audit menu price, tax settings, discounts, voids/refunds, staff roles and booking changes.
- Logs redact tokens, passwords, payment credentials and customer contact fields.
- Health endpoints must not expose secrets or detailed database connection strings.

## 6. Environment variables (illustrative)

```dotenv
APP_ENV=development
APP_SECRET_KEY=change-me-in-local-only
DATABASE_URL=sqlite:///./data/cafe_local.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
PUBLIC_SITE_URL=http://localhost:5173
PUBLIC_BOOKING_ENABLED=false
BOOKING_AUTO_CONFIRM=false
CAFE_TIMEZONE=Asia/Kolkata
DEFAULT_CURRENCY=INR
MEDIA_STORAGE=local
LOCAL_MEDIA_PATH=./data/media
SESSION_COOKIE_SECURE=false
LOG_LEVEL=INFO
```

Production values must use secure secrets, deployed database URL, HTTPS origin list, durable media storage, and tested backup configuration. Never commit a real `.env` file.

## 7. Migration and backup approach

- Use Alembic migrations for all schema modifications.
- Test migrations against clean SQLite and PostgreSQL databases.
- Local SQLite backup should use SQLite's backup API or a safe consistent backup method, not copy a live DB file during writes without coordination.
- Hosted PostgreSQL backups must be automatic and exported to a separate storage/account where feasible.
- Document retention, encryption, access permissions and restore procedure.
- A release must not run destructive migrations without a verified backup and rollback plan.


---

<!-- SOURCE FILE: IMPLEMENTATION_PLAN.md -->

# IMPLEMENTATION PLAN AND ACCEPTANCE GATES

## Guiding approach
Build a vertical slice at a time. First make the local application work end-to-end, then add reliable local POS behaviour, then prepare a hosted API for real online booking. Do not build all UI pages as disconnected mockups.

## Phase 0 — Clarify, scaffold, agree contracts
**Deliverables**
- Inspect repository and existing code before modifying anything.
- Confirm stack versions and establish monorepo or documented separate apps.
- Create `AGENTS.md`, `.env.example`, `.gitignore`, README, lint/format config.
- Create initial DB entities and Alembic baseline.
- Create OpenAPI contract and typed frontend API client.
- Create `docs/OPEN_DECISIONS.md` listing details the owner must supply.

**Gate:** clean install/build commands work; backend health endpoint responds; frontend shell loads; migration creates a clean database; no credentials committed.

## Phase 1 — Brand shell and public menu
**Deliverables**
- Design tokens, responsive public layout and reusable components.
- Homepage sections, contact/hours, menu page and QR menu page.
- Public menu API and demo seed data clearly labelled demo.
- QR generation and table QR management shell.

**Gate:** menu content comes from DB/API, not hardcoded React arrays; public pages work on phone widths; generated QR points to correct stable route.

## Phase 2 — Admin CMS and authentication
**Deliverables**
- Staff login/logout and backend role permissions.
- Admin shell and dashboard summary placeholder backed by API.
- Menu category/item CRUD, image upload adapter, availability toggle.
- Cafe profile, hours and homepage content editing.
- Table CRUD and QR download/regeneration.
- Audit log for sensitive edits.

**Gate:** an owner can change menu item name/price/availability and see it on public menu without rebuilding frontend; cashier cannot access owner-only settings; archived menu item remains on historical order lines.

## Phase 3 — Reservations
**Deliverables**
- Booking settings, capacity and blackout dates.
- Public availability endpoint and reservation submission.
- Admin reservation list, filter, confirm/decline/reschedule/cancel actions.
- Duplicate submission protection and concurrent capacity tests.
- Feature flag for public booking; disabled mode offers phone/contact fallback.

**Gate:** no fake confirmations; two concurrent requests cannot overbook; closed dates/out-of-hours/party limits are enforced server-side.

## Phase 4 — POS and receipts
**Deliverables**
- Staff POS screen, product search/categories, order cart and order type.
- Backend order service with server-side totals and snapshot line items.
- Payment recording for cash/manual UPI/manual card terminal/other.
- Unique receipt sequence, print CSS and receipt reprint.
- Role/discount/void controls and audit events.
- Basic sales and payment reports.

**Gate:** complete sale and receipt flow works; receipt reprint does not duplicate sale; prices remain historically correct after menu edits; concurrent checkout tests preserve unique receipt numbers.

## Phase 5 — Local-first / offline resilience
**Deliverables**
- PWA installability and asset/menu cache.
- IndexedDB for local cart/draft and outbox queue.
- Sync status UI, idempotency keys and retry logic.
- Conflict handling when price/item availability changes.
- Document which actions are available with local server vs WAN unavailable.

**Gate:** disconnect network during a supported local workflow; no data is silently lost; pending state is obvious; retry does not duplicate orders/payments; price conflicts are shown for staff resolution.

## Phase 6 — Public hosting and launch readiness
**Deliverables**
- Static frontend deployment configuration.
- Hosted FastAPI deployment configuration and PostgreSQL connection.
- Durable media storage adapter for hosted assets.
- HTTPS, exact CORS allowlist, production secrets, logging, health checks.
- Backup/restore and deployment runbooks.
- Test public booking from a phone using mobile data (outside cafe Wi-Fi).

**Gate:** public booking reaches hosted API; public requests never depend on cafe PC localhost; a backup restore succeeds; current free/paid hosting limits and commercial terms are checked.

## Phase 7 — Optional enhancements
Potential later work: kitchen display, online payment gateway, customer order ahead, QR ordering, loyalty, inventory recipes/stock deductions, advanced reports, multi-branch, email/SMS confirmations, accounting export.

---

## Agent work allocation

| Workstream | Owner | Owns | Depends on |
|---|---|---|---|
| Lead architect | Lead agent | repo structure, contracts, integration, decisions | none |
| UX/UI | Frontend design agent | `DESIGN_SYSTEM.md`, component inventory, page design | product spec |
| Public frontend | Frontend agent A | public website, menu, QR, booking UI | API contract |
| Admin/POS frontend | Frontend agent B | admin, booking console, POS UI | API contract, design system |
| Backend domain | Backend agent A | models, services, reservations, menu | domain contract |
| Billing/POS backend | Backend agent B | orders, payments, receipt logic, reports | domain contract |
| QA | QA agent | tests, bug reports, acceptance matrix | working branches |
| Deployment/security | DevOps agent | local scripts, Docker, hosting, secrets, backup docs | stable app |

If only one coding agent is available, it should still follow the same phase gates and keep each workstream in separate modules.

## Required test matrix

| Area | Tests |
|---|---|
| Menu | category filters, availability, archived items, image failure, price format |
| Auth | login, invalid credentials, disabled user, role matrix, rate limiting |
| Reservations | opening hours, blackout dates, party size, lead time, capacity, duplicate submit, concurrent requests, disabled booking mode |
| POS | create order, quantity changes, modifiers, discount role limits, price snapshot, payment idempotency, receipt uniqueness, void permissions |
| Offline | queued draft, retry, duplicate prevention, changed price, deleted/unavailable item, server unavailable |
| UI | mobile nav, keyboard flow, validation, loading/empty/error state, accessibility smoke tests |
| Data | clean migrations, migration upgrade, backup, restore, CSV export |
| Deployment | CORS, HTTPS, environment validation, health/readiness endpoints, external phone booking test |

## Release report template

At the end of every phase, the agent must report:
1. Features completed.
2. Files created/changed.
3. Commands run.
4. Tests and exact pass/fail counts.
5. Known defects and technical debt.
6. Decisions needed from owner.
7. Next small task proposed.


---

<!-- SOURCE FILE: PROMPTS.md -->

# COPY-READY AGENT PROMPTS

Use these prompts with `AGENTS.md` plus the relevant specification files.

## 1. Lead / orchestrator agent

```text
You are the technical lead for this cafe management platform. Read AGENTS.md, MASTER_PRODUCT_SPEC.md, DESIGN_SYSTEM.md, BACKEND_CONTRACT.md, and IMPLEMENTATION_PLAN.md completely. Treat them as binding requirements.

First inspect the current repository and report what already exists. Do not overwrite working code. Propose a concrete implementation sequence, file ownership map for parallel agents, API contract changes (if any), and a Phase 0 checklist. Maintain docs/OPEN_DECISIONS.md for unknown cafe-specific information. Do not invent cafe details, prices, tax rules, provider credentials, or hosting permissions.

Coordinate small tasks with explicit acceptance criteria. Prevent multiple agents editing the same files. Require tests and a release report for every completed phase. Ensure the public booking feature cannot claim success without a real reachable API. Ensure all monetary calculations happen server-side using integer minor units. Integrate only after frontend/backend contracts match.
```

## 2. UI/UX designer or frontend design agent

```text
You are the product designer and frontend design-system owner. Read AGENTS.md, MASTER_PRODUCT_SPEC.md and DESIGN_SYSTEM.md. Create the actual React design system and responsive page layouts for the public cafe website, mobile QR menu, booking flow, admin panel and POS.

Use the warm editorial cafe direction and the provided design tokens as editable defaults. Do not copy another site's branding, text or images. Do not invent cafe name, logo, claims, address, menu content or hours. Use clearly marked demo placeholders. Prioritize mobile menu usability, accessible forms, and a fast operational POS.

Deliver component architecture, route map, tokens, responsive states, empty/loading/error states, and implementation. Ensure every control has a real action or is visibly disabled. Test 360px, 390px, 768px, 1024px and desktop widths. Follow WCAG 2.2 AA as a target. Report files changed and test results.
```

## 3. Frontend implementation agent

```text
You are the React + TypeScript frontend engineer. Read AGENTS.md, MASTER_PRODUCT_SPEC.md, DESIGN_SYSTEM.md, BACKEND_CONTRACT.md, and IMPLEMENTATION_PLAN.md. Implement only the assigned phase and files.

Use React + TypeScript strict mode, Vite, React Router, TanStack Query, React Hook Form + Zod, Tailwind CSS and accessible component primitives. Use a typed API client; do not scatter raw fetch calls through components. Keep public website, QR menu, booking, admin and POS feature modules separate. Implement all loading, empty, success, error, offline and permission states.

Do not hardcode business data in UI when it belongs in the API. Do not calculate final bills in the browser. For offline operations, persist drafts/outbox entries with idempotency keys and show pending sync; never show an unacknowledged booking or payment as confirmed. Coordinate API schema changes with the backend agent before coding.

Run lint, typecheck, unit tests and relevant Playwright flows. Report exact commands and results.
```

## 4. Backend implementation agent

```text
You are the Python backend engineer. Read AGENTS.md, MASTER_PRODUCT_SPEC.md and BACKEND_CONTRACT.md completely. Implement a modular FastAPI service using Pydantic, SQLAlchemy 2.x and Alembic. Use SQLite for local development and PostgreSQL-compatible schema/query patterns for hosted deployment.

Keep route handlers thin; place business rules in services. Implement role-based authorization on the server, request validation, safe errors, transactions, database constraints, indexes, audit events and idempotency. Use integer minor units for all money. Reservation capacity checks must be concurrency-safe. Orders must snapshot item names/prices/tax details and receipt numbers must be generated transactionally. Do not assume GST rates or legal invoice rules.

Do not build real provider integrations without credentials. Never expose secrets or personal customer data in public responses or logs. Add pytest coverage for normal and failure paths, create migrations, seed only obviously labelled demo data, and document local run commands.
```

## 5. QA / test agent

```text
You are the QA engineer. Read AGENTS.md, MASTER_PRODUCT_SPEC.md, BACKEND_CONTRACT.md and IMPLEMENTATION_PLAN.md. Convert acceptance criteria into a test plan. Inspect the implementation and identify mismatches, not just crashes.

Test the complete customer booking journey, menu and QR routes, admin menu edits, staff role permissions, POS checkout, receipt reprint, historical price snapshots, offline queue and retry behaviour. Include negative cases, concurrent booking capacity, duplicate payment retries, and mobile layout/accessibility smoke tests. Verify disabled booking mode never displays a false confirmation.

Do not change product requirements to make tests pass. File bugs with reproduction steps, expected behaviour, actual behaviour, severity and relevant logs. Re-test fixes and report exact outcomes.
```

## 6. DevOps / deployment agent

```text
You are the deployment and reliability engineer. Read AGENTS.md, MASTER_PRODUCT_SPEC.md, BACKEND_CONTRACT.md and IMPLEMENTATION_PLAN.md. Make local development reproducible first, then prepare a separate hosted profile.

Provide .env.example, safe secret handling, local startup scripts, optional Docker Compose, health checks, migrations, backup/restore commands, static frontend deployment and Python API deployment configuration. Do not deploy a SQLite file to an ephemeral filesystem. Do not treat Render Free or a pausing free database as production-ready. Re-check official plan terms, limits and commercial-use conditions on deployment day. Vercel Hobby is not suitable for a commercial cafe deployment under its non-commercial restriction.

Document which features work offline, which require internet, how public booking reaches the API, how media is stored durably, how to configure HTTPS/CORS, and how to restore from backups. Run a real external-network booking smoke test after deployment.
```

## 7. Code review agent

```text
Review the proposed changes against AGENTS.md and the relevant specification files. Do not rewrite code immediately. Identify requirement gaps, security issues, data integrity risks, accessibility problems, API contract mismatches, missing tests, race conditions, and deployment assumptions. Rank findings as Critical/High/Medium/Low and include file/line references and suggested fixes. Specifically inspect money precision, reservation capacity under concurrency, receipt uniqueness, historical order snapshots, role enforcement, idempotency and offline states.
```
