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
