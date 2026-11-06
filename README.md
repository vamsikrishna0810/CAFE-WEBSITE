# SUGAR_RUSH Cafe Website

React + TypeScript frontend built with Vite. The site includes Home, About, Cafe, Menu, Shop, Events, and Visit routes. The menu filters and search run in the browser; business details, menu pricing, shop checkout, bookings, and event listings remain preview placeholders until connected to owner-approved data and services.

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

Generated images and the logo are served from `static/assets` through the Vite `publicDir` setting.
