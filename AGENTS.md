# Project instructions

Before changing product behavior, read the requirements in:

- `cafe_ai_agent_kit/AGENTS.md`
- `cafe_ai_agent_kit/MASTER_PRODUCT_SPEC.md`
- `cafe_ai_agent_kit/BACKEND_CONTRACT.md`
- `cafe_ai_agent_kit/DESIGN_SYSTEM.md`
- `cafe_ai_agent_kit/IMPLEMENTATION_PLAN.md`

Treat these documents as the product source of truth. Record unresolved cafe-specific details in `docs/OPEN_DECISIONS.md`; do not invent business identity, contact details, hours, menu items, prices, tax rules, or booking policy.

The React/Vite app is currently a public-site preview, not a connected cafe platform. Do not present preview-only bookings, payments, menu data, or business details as real. Keep customer-facing pages responsive and accessible, and keep the backend authoritative for menu data, bookings, permissions, and money calculations.

Use `docs/PHASE0_CHECKLIST.md` to track foundation work. Keep changes small and update the relevant product documentation when contracts or assumptions change. Never commit credentials or `.env` files; use `.env.example` for variable names and safe defaults only.
