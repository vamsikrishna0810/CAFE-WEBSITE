# Phase 0: foundation and contracts

## Repository snapshot

- Current app: React 19, TypeScript strict mode, Vite 8 public-site preview.
- Existing routes: Home, About, Cafe, Menu, Shop, Events, Visit.
- Menu search/filtering uses an in-browser sample array; there is no API or database.
- No backend, migrations, typed API client, auth, `.env.example`, or root agent instructions existed at the start of this checklist.
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
- [ ] Confirm Node/Python versions available in the development environment and choose compatible backend dependency versions.
- [ ] Scaffold the FastAPI service with a health endpoint and environment validation.
- [ ] Add initial SQLAlchemy entities and Alembic baseline migration.
- [ ] Publish the initial OpenAPI contract and add a typed frontend API client.
- [ ] Document local setup for both apps and clean-database initialization.
- [ ] Complete the Phase 0 acceptance gate before starting Phase 1 integrations.

## Reference notes for Phase 1

Use the Oak Hill reference for broad structure only: group menus clearly, make the primary visit action visible, and surface hours/location/contact information without burying it. Keep the current concept's own visual identity and assets; replace concept materials with owner-approved content before launch. Do not copy the reference site's branding, text, photos, or business data.

## Reference-informed UI work started on `dev`

- Added a prominent reservation-information link from the homepage and navigation, following the reference's clear booking action.
- Added `/book` as an explicit unavailable-state page. It states that no request is accepted or confirmed, and links visitors to the current visit information or sample menu.
- Real hours, venue details, and reservation rules remain blocked on owner decisions and a reachable backend; this page does not use Oak Hill's details.
