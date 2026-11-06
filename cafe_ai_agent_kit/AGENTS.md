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
