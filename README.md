# Cafe Platform (working name: SUGAR_RUSH)

The current application is a React + TypeScript public site built with Vite. It includes Home, About, Cafe, Menu, Shop, Events, Visit, reservation-information, and local admin routes. The public menu, profile, story, opening hours, social links, and events read from the local API when connected; reservations remain disabled until booking rules and a reachable service are configured.

The product brief and implementation plan live in [`cafe_ai_agent_kit/`](cafe_ai_agent_kit/README_START_HERE.md). Read the project-level [`AGENTS.md`](AGENTS.md) and the kit's requirements before implementing product features. Current owner decisions and the Phase 0 checklist are in [`docs/`](docs/OPEN_DECISIONS.md).

The local password-protected admin at `/admin` edits the menu, cafe profile, opening hours, and events through the SQLite API. Follow [`backend/README.md`](backend/README.md) to set it up. The seeded profile and menu are demo data; menu items start unavailable.

The Oak Hill Café & Farm website listed by the kit is a layout reference only. We are adapting general patterns such as clear menu groupings, prominent visit actions, and easy-to-find hours and location. Its brand, copy, photos, and business details are not project content.

## Run locally

Use Node.js 22.22 or newer, then from this folder:

```powershell
npm install
npm run dev
```

Open the local address printed by Vite, usually `http://localhost:5173`.

For the password-protected admin and local SQLite API, follow [`backend/README.md`](backend/README.md). The current workspace uses Python 3.13.17. Open `/admin` on the Vite site after starting both services.

To create a production bundle:

```powershell
npm run build
```

Generated images and the logo are served from `static/assets` through the Vite `publicDir` setting. They are concept assets and must be replaced with owner-approved material before launch.
