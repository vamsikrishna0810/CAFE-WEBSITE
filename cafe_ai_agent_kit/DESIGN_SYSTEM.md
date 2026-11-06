# DESIGN SYSTEM — Cafe Platform

## 1. Creative direction

**Direction:** contemporary neighbourhood cafe with a warm editorial identity. The result should feel premium, calm, tactile and inviting — not like a restaurant-chain template or a generic SaaS landing page.

**Reference principles:**
- Use the compact, scrollable information architecture described in [Superboosted Design's cafe website guide](https://www.superboosted.design/guides/best-cafe-website-examples): customers should quickly find the menu, hours, location and contact details.
- Use [Oak Hill Café & Farm](https://oakhillcafe.webflow.io/) as one visual reference for the prominent reservation CTA, image-led first impression, and clear hours/location treatment. Do not copy its identity or assets.
- Prefer actual cafe and dish photography supplied by the owner. Replace all demo photos before launch.

## 2. Design tokens

Treat these as a starting theme, not fixed brand facts. Define CSS variables/tailwind tokens so the owner can change the theme centrally.

| Token | Suggested value | Use |
|---|---|---|
| `--color-espresso` | `#25231F` | Main text, dark footer, strong buttons |
| `--color-cream` | `#F7F3EB` | Main page background |
| `--color-paper` | `#FFFEFA` | Cards, menus, forms |
| `--color-sage` | `#77856B` | Primary accent, badges, subtle links |
| `--color-sage-dark` | `#53634B` | Hover/active accent |
| `--color-clay` | `#B87555` | Occasional warm highlight |
| `--color-muted` | `#77736C` | Secondary text |
| `--color-line` | `#E4DED3` | Borders/dividers |
| `--color-success` | `#28734B` | Success state only |
| `--color-warning` | `#9A5B14` | Warning state only |
| `--color-danger` | `#B33B32` | Destructive/error state only |

**Typography**
- Display/headings: `DM Serif Display`, `Cormorant Garamond`, or an equivalent expressive serif.
- UI/body: `Inter`, `Manrope`, or a clean system sans-serif.
- Use a system-font fallback if remote fonts are unavailable.
- Avoid too many weights. Use clear hierarchy and generous line height.

**Shape and spacing**
- Use 8px-based spacing increments.
- Public cards: 12–18px radius; buttons: 999px pill only for major public CTA if it suits the brand; admin controls: 8–10px radius.
- Thin borders, restrained shadows, generous whitespace.
- Avoid excessive blur/glassmorphism, neon gradients, oversized rounded dashboard cards, and decorative animation.

## 3. Public website layout

### Desktop homepage wireframe

```text
┌──────────────────────────────────────────────────────────────────────┐
│ LOGO / CAFE NAME       MENU   OUR STORY   VISIT US   [BOOK A TABLE]  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Small eyebrow                                                        │
│  A thoughtful headline          LARGE AUTHENTIC CAFE / FOOD PHOTO    │
│  Short welcoming description                                          │
│  [EXPLORE MENU] [BOOK A TABLE]                                        │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  A LITTLE SOMETHING FOR EVERY MOOD                                    │
│  Featured menu cards (image, name, short detail, price)               │
├──────────────────────────────────────────────────────────────────────┤
│  MENU PREVIEW                 [VIEW FULL MENU]                        │
│  Category tabs + readable item rows                                   │
├──────────────────────────────────────────────────────────────────────┤
│  OUR STORY                   AUTHENTIC INTERIOR / PEOPLE PHOTO         │
├──────────────────────────────────────────────────────────────────────┤
│  VISIT US: HOURS | ADDRESS | MAP LINK | PHONE                         │
├──────────────────────────────────────────────────────────────────────┤
│  GALLERY / SOCIAL LINKS                                                │
├──────────────────────────────────────────────────────────────────────┤
│  Footer: cafe identity, menu, contact, policies, social               │
└──────────────────────────────────────────────────────────────────────┘
```

### Public homepage rules
- Keep the top navigation simple. On mobile, collapse into a clear menu drawer or compact nav.
- First screen: identity, one concise message, strong image, menu CTA and booking CTA.
- Show actual opening hours and address in a prominent visit section; don't bury them.
- Menu should be readable HTML, not a PDF-only menu.
- Buttons must have clear labels and adequate contrast.
- Add tasteful motion only for small transitions; respect `prefers-reduced-motion`.
- Use responsive image sizes and lazy-load below-the-fold gallery images.

## 4. QR menu layout

**Mobile-first target:** 360–430px viewport.

```text
┌────────────────────────────────┐
│ CAFE NAME                 MENU │
│ Table 08 (only if table QR)     │
│                                │
│ [Search menu................]  │
│ [Coffee] [Tea] [Food] [Sweets] │
│                                │
│ FEATURED                        │
│ ┌────────────────────────────┐ │
│ │ Item photo                 │ │
│ │ Cappuccino          ₹160   │ │
│ │ Short description          │ │
│ │ Veg / allergen notes       │ │
│ └────────────────────────────┘ │
│                                │
│ COFFEE                         │
│ Espresso                ₹120   │
│ Short description              │
│ ────────────────────────────── │
│ Latte                   ₹180   │
│ Short description              │
│                                │
│ Hours • Address • Call         │
└────────────────────────────────┘
```

- No login wall, no horizontal scrolling.
- Search and category chips should remain usable with a thumb.
- Price should be visually easy to scan and consistently formatted.
- Keep descriptions short and optional; avoid overcrowding.
- Show allergen/dietary information only when supplied and verified by the owner.
- Make unavailable items unmistakable.
- QR/table context must be safe to display publicly; never expose order history or customer data.

## 5. Booking UX

- Use a short, stepwise form if it improves mobile usability: date/time/party size, then contact details.
- Explain that a booking is a request until backend policy confirms it.
- Show local timezone, opening/closed days, cancellation instructions and contact fallback.
- Validation should be inline and specific; preserve user input after recoverable errors.
- Confirmation screen must display server-returned status and reference code.
- When booking API is disabled, show a graceful disabled state with phone/contact CTA instead of a dead form.

## 6. Admin design

**Direction:** clean operational workspace. Prioritize information hierarchy, readable tables, predictable forms and clear actions over marketing visuals.

### Admin shell
- Left sidebar: Dashboard, POS, Menu, Bookings, Orders, Tables & QR, Reports, Content, Staff, Settings.
- Top bar: page title, date/context, sync/network status, current staff and sign out.
- Main content: page-specific tables, forms and summary sections.
- Sidebar collapses on tablets/mobile; mobile POS can use bottom navigation or an accessible drawer.

### Admin page rules
- Lists need search, filters, sorting, pagination, empty states and clear row actions.
- Edit forms use labels, help text, validation and save/cancel actions.
- Destructive actions require confirmation and an audit reason where applicable.
- Unsaved changes must be indicated; prevent accidental navigation loss.
- Never use color as the only status signal; pair color with text/icon.
- Tables must remain usable on narrow viewports; use responsive cards or horizontal overflow with clear affordance.

## 7. POS design

**Speed and reliability are more important than decoration.**

Desktop layout concept:
- Left/main area: category tabs and searchable product grid/list.
- Right side: persistent cart with item rows, quantity controls, note/modifier, subtotal, discount and total.
- Bottom/right: order type, table selector, payment method and primary complete action.
- Large touch targets (minimum 44×44 CSS px), keyboard shortcuts only when documented and not conflicting with accessibility.
- Make network state and pending sync visible at all times.
- Clearly distinguish draft, unpaid, paid, voided and refunded orders.
- Confirmation before void/refund/discount above configured limit.

## 8. Component inventory

Build reusable components, at minimum:
- `SiteHeader`, `MobileNav`, `HeroSection`, `FeaturedItemCard`, `MenuCategoryTabs`, `MenuItemRow`, `MenuItemCard`, `OpeningHours`, `LocationBlock`, `SiteFooter`.
- `BookingForm`, `AvailabilityPicker`, `BookingStatusBadge`, `BookingDetailPanel`.
- `AdminShell`, `SidebarNav`, `PageHeader`, `DataTable`, `FilterBar`, `EmptyState`, `ConfirmDialog`, `FormField`, `ImageUploader`, `StatusBadge`, `Toast/InlineAlert`.
- `POSLayout`, `POSCategoryNav`, `ProductSearch`, `ProductTile`, `CartPanel`, `CartLine`, `OrderSummary`, `PaymentSelector`, `ReceiptPreview`, `SyncStatus`.

## 9. Accessibility and responsive requirements

- Target WCAG 2.2 AA as a design goal.
- Semantic HTML landmarks and heading order.
- Visible keyboard focus; complete keyboard navigation for menus/dialogs/forms/tables.
- Inputs have visible labels; errors are associated with inputs and announced appropriately.
- Contrast must be checked for all text, including muted text and badges.
- Provide alt text for meaningful images; decorative images use empty alt.
- Respect reduced-motion and browser zoom.
- Test at 360px, 390px, 768px, 1024px, 1440px widths.
- Do not rely on hover for essential mobile functionality.

## 10. Content and imagery rules

- Use editable placeholder copy until cafe details are supplied.
- Do not generate false claims such as organic, locally sourced, award-winning, allergen-free, vegan, or gluten-free.
- Do not use placeholder address/phone as if real.
- Any sample menu item or price must be visibly marked demo in development.
- Use licensed, owner-supplied or permitted assets; record source/licence for stock imagery.

## 11. Design acceptance checklist

- Homepage communicates cafe identity and the next action within a few seconds.
- Menu and visit details are easy to reach on mobile.
- QR menu needs no app installation or account.
- Admin can update content without code changes.
- POS can be operated with mouse/touch and keyboard.
- Focus states, validation, error messages and contrast are usable.
- Layout remains stable when images are missing or API is offline.
