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
