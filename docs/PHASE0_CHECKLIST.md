# Phase 0: foundation and contracts

## Repository snapshot

- Current app: React 19, TypeScript strict mode, Vite 8 public-site preview.
- Existing routes: Home, About, Cafe, Menu, Shop, Events, Visit, reservation information, and local admin.
- The public menu/profile/events use the local API when connected and retain labelled preview content where appropriate.
- The `dev` branch now has a local FastAPI/SQLite service, initial Alembic migration, password-protected admin API, and typed frontend API client.
- The kit's source-of-truth documents are in `cafe_ai_agent_kit/`.

## Decisions and proposed architecture

- Keep the existing Vite frontend as the customer-facing app.
- Add a separate local FastAPI service under `backend/`; use SQLite locally and preserve PostgreSQL compatibility for a hosted mode.
- Keep API paths under `/api/v1`, document request/response shapes, and generate the OpenAPI schema from FastAPI.
- Use SQLAlchemy models and Alembic migrations; make the backend authoritative for menu data, booking decisions, authorization, and all money calculations.
- Add a small typed frontend API layer rather than scattering raw requests across page components.
- Keep public booking disabled until a reachable API and owner-approved policy are configured.
- Keep cafe-specific identity and operational values unresolved in `docs/OPEN_DECISIONS.md` rather than filling them with reference-site or sample data.

## Checklist

- [x] Inspect the existing app, project brief, product spec, UI guidance, API contract, and implementation phases.
- [x] Create project-level instructions that point to the kit's source of truth.
- [x] Add safe environment-variable examples and ignore local secrets/cache files.
- [x] Record owner decisions needed before real customer-facing operation.
- [x] Record Phase 0 assessment and initial architecture decisions.
- [x] Confirm Node 26.13.0 and Python 3.13.17; choose dependency ranges compatible with Python 3.13.
- [x] Scaffold the FastAPI service with health, public content, authenticated admin endpoints, and local-origin CORS.
- [x] Add SQLAlchemy entities and an Alembic baseline migration for menu, cafe settings/hours, and events.
- [x] Expose generated OpenAPI at the local FastAPI `/docs` route and add a typed frontend API client.
- [x] Document local setup and clean-database initialization in `backend/README.md`.
- [ ] Complete the Phase 0 acceptance gate before starting Phase 1 integrations.

## Reference notes for Phase 1

Use the Oak Hill reference for broad structure only: group menus clearly, make the primary visit action visible, and surface hours/location/contact information without burying it. Keep the current concept's own visual identity and assets; replace concept materials with owner-approved content before launch. Do not copy the reference site's branding, text, photos, or business data.

## Reference-informed UI work started on `dev`

- Added a prominent reservation-information link from the homepage and navigation, following the reference's clear booking action.
- Added `/book` as an explicit unavailable-state page. It states that no request is accepted or confirmed, and links visitors to the current visit information or sample menu.
- Real hours, venue details, and reservation rules remain blocked on owner decisions and a reachable backend; this page does not use Oak Hill's details.

## Local admin slice on `dev`

- Added `/admin` with password login, overview, menu editing/prices/availability, cafe profile/contact/story/announcement/social links/hours, event drafts, and a disabled reservations section.
- Added SQLite seed data. Sample foods and prices are demo data and initially unavailable.
- The public menu, visit profile/hours, and events read saved data when the local API is running; otherwise the public menu remains a labelled preview.
- The phase is not production-ready until deployment security, backups, and acceptance checks are complete and verified cafe information is supplied.
