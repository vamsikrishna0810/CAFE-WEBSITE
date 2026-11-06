# Cafe Platform (working name: SUGAR_RUSH)

The current application is a React + TypeScript public-site preview built with Vite. It includes Home, About, Cafe, Menu, Shop, Events, Visit, and reservation-information routes. Menu search and filters run in the browser. Business details, menu pricing, reservations, shop checkout, and event listings remain placeholders until connected to owner-approved data and services.

The product brief and implementation plan live in [`cafe_ai_agent_kit/`](cafe_ai_agent_kit/README_START_HERE.md). Read the project-level [`AGENTS.md`](AGENTS.md) and the kit's requirements before implementing product features. Current owner decisions and the Phase 0 checklist are in [`docs/`](docs/OPEN_DECISIONS.md).

The Oak Hill Café & Farm website listed by the kit is a layout reference only. We are adapting general patterns such as clear menu groupings, prominent visit actions, and easy-to-find hours and location. Its brand, copy, photos, and business details are not project content.

## Run locally

Use Node.js 22.22 or newer, then from this folder:

```powershell
npm install
npm run dev
```

Open the local address printed by Vite, usually `http://localhost:5173`.

To create a production bundle:

```powershell
npm run build
```

Generated images and the logo are served from `static/assets` through the Vite `publicDir` setting. They are concept assets and must be replaced with owner-approved material before launch.
