# Cafe Management Platform — AI Agent Kit

This kit is the working product brief for building a cafe's public website, QR menu, online reservations, admin panel, and billing/POS system.

## How to use this kit

1. Give the coding agent **`AGENTS.md` and `MASTER_PRODUCT_SPEC.md` first**. These are the source of truth.
2. Give the frontend/UI agent `DESIGN_SYSTEM.md` and `IMPLEMENTATION_PLAN.md`.
3. Give the backend/data agent `BACKEND_CONTRACT.md` and `MASTER_PRODUCT_SPEC.md`.
4. Give the lead/orchestrator agent all files and ask it to keep the shared API contract and task board consistent.
5. Ask agents to work in small, reviewable phases. Do not let multiple agents rewrite the same files simultaneously.

## Recommended first prompt

> Read `AGENTS.md`, `MASTER_PRODUCT_SPEC.md`, `DESIGN_SYSTEM.md`, `BACKEND_CONTRACT.md`, and `IMPLEMENTATION_PLAN.md` completely. Do not start by generating the entire application in one pass. First inspect the repository, identify missing decisions, propose the architecture and file tree, and produce a Phase 0 implementation checklist. Preserve the requirements and constraints in these files. Then implement only the first approved phase, run tests, and report changed files, commands run, test results, and remaining work.

## Important operating decision

The initial development and in-cafe POS can run locally. A static website can be published free, but **real public online bookings require an internet-accessible API and database**. A browser on a customer's phone cannot send a booking to `localhost` on the cafe owner's computer. The default development mode must therefore keep the backend local and show public booking as a clearly labelled preview/disabled feature until a cloud API is configured. Never fake a confirmed reservation.

## Files

- `AGENTS.md` — mandatory instructions for every AI/coding agent.
- `MASTER_PRODUCT_SPEC.md` — product requirements, workflows, architecture, scope, and acceptance criteria.
- `DESIGN_SYSTEM.md` — visual direction, page layouts, component rules, responsive/accessibility rules.
- `BACKEND_CONTRACT.md` — domain model, API outline, business rules, security, offline constraints.
- `IMPLEMENTATION_PLAN.md` — milestones, task breakdown, acceptance gates, test strategy.
- `PROMPTS.md` — copy-ready prompts for lead, frontend, backend, QA, and deployment agents.

## Research and platform notes (checked 4 November 2026)

- Cafe website UX reference: [Best Cafe Website Examples — Superboosted Design](https://www.superboosted.design/guides/best-cafe-website-examples). Patterns worth adapting: concise scrollable information architecture, readable HTML menu (not only a PDF), strong real venue/food photography, visible opening hours/location, and a clear next action.
- Visual example: [Oak Hill Café & Farm](https://oakhillcafe.webflow.io/). Use it as layout inspiration only; do not copy its branding, text, assets, or exact composition.
- [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/) currently document a free static-site tier with 500 builds/month, one concurrent build, up to 20,000 files/site and 25 MiB max asset size. Verify current limits and terms before launch.
- [Render free deployment limits](https://render.com/docs/free) explicitly warn that free services are not for production; free web services spin down after 15 minutes idle and have ephemeral filesystems. Free Render Postgres expires after 30 days. Do not store the cafe's live SQLite database or permanent uploads on a free Render filesystem.
- [Supabase pricing](https://supabase.com/pricing) currently lists a free Postgres project with 500 MB database storage; free projects may pause after one week of inactivity. This can suit a prototype, not a business-critical POS without tested backups and an upgrade plan.
- [Vercel Hobby terms](https://vercel.com/legal/terms) restrict Hobby use to personal/non-commercial use. Do not select that tier for a live commercial cafe website. Review the current commercial terms of every host before publishing.

Hosting terms, quotas, pricing, data-residency, and feature limits change. Agents must re-check official provider documentation on the day of deployment and must not claim a free tier is production-grade merely because it is available at $0.
