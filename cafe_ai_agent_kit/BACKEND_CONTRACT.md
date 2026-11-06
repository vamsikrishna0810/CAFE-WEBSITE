# BACKEND CONTRACT — Domain, API, and business rules

## 1. Backend conventions

- Base path: `/api/v1`.
- JSON request/response, UTF-8.
- Use UUIDs or opaque IDs for public-facing references; never expose sequential primary keys as security tokens.
- Use database transactions for order completion, receipt numbering, booking capacity reservation and audit events.
- Use UTC timestamps in storage; localize to cafe timezone for display.
- Money: integer minor units (e.g. INR 100 paise = ₹1.00) plus explicit `currency_code`. Do not use float.
- Pagination: cursor or page/limit with a maximum page size.
- Standard error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "field_errors": {"phone": "Enter a valid phone number."},
    "request_id": "opaque-request-id"
  }
}
```

Do not expose stack traces, SQL, internal host paths, secrets or PII in errors.

## 2. Core entities and suggested fields

This is a domain contract, not a command to put every field in one table. Agents should normalize the schema where appropriate and document deviations.

### Cafe and site
- `cafe_profile`: `id`, `display_name`, `legal_name` (nullable), `tagline`, `logo_asset_id`, `phone`, `email`, `address_text`, `map_url`, `timezone`, `currency_code`, `created_at`, `updated_at`.
- `site_content`: `key`, `json_value`, `published_at`, `updated_by` — or normalized page/section tables. Use a schema that is validated and versionable.
- `opening_hours`: `weekday`, `opens_at`, `closes_at`, `is_closed`; support split shifts if needed.
- `cafe_settings`: booking, tax, receipt, discount and operational settings with typed validation.

### Staff and security
- `staff_user`: `id`, `name`, `username/email`, `password_hash`, `role_id`, `is_active`, `created_at`, `last_login_at`.
- `role`: `id`, `name`, permissions or a fixed role enum plus permission map.
- `audit_event`: `id`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `safe_metadata_json`, `created_at`, `request_id`.
- `staff_session` if using server-managed sessions.
- `shift`: `id`, `opened_by`, `opened_at`, `opening_cash_minor`, `closed_by`, `closed_at`, `closing_cash_minor`, `status`.

### Menu
- `menu_category`: `id`, `name`, `slug`, `description`, `display_order`, `is_active`.
- `menu_item`: `id`, `category_id`, `name`, `slug`, `description`, `image_asset_id`, `sku`, `price_minor`, `currency_code`, `tax_class_id`, `is_available`, `is_featured`, `display_order`, dietary flags, allergen notes, `archived_at`.
- `modifier_group`: `id`, `name`, `min_select`, `max_select`, `is_required`.
- `modifier_option`: `id`, `group_id`, `name`, `price_delta_minor`, `is_available`.
- `menu_item_modifier_group`: association table.
- Menu items referenced by orders must be archived, not hard-deleted.

### Tables and QR
- `dining_table`: `id`, `label`, `capacity`, `is_active`, `display_order`.
- `table_qr_token`: `id`, `table_id`, `public_token` (random, revocable), `created_at`, `revoked_at`.
- Public QR route contains a random opaque token or table slug; never use the table database ID as authorization.

### Reservations
- `reservation`: `id`, `public_reference`, `customer_name`, `phone`/`email` (at least one configured contact route), `party_size`, `starts_at_utc`, `ends_at_utc`, `status`, `customer_note`, `internal_note`, `source`, `created_at`, `updated_at`, `created_by` nullable.
- `reservation_capacity_rule`: day/time capacity or table/seat capacity; document the capacity algorithm.
- `blackout_date`: `date`, `reason`, `is_closed`.
- Optional `reservation_table_assignment` if assigning actual tables in MVP.
- Index on date/time, status and reference. Do not return contact details from public availability endpoints.

### Orders and billing
- `order`: `id`, `order_number`, `order_type` (`dine_in`, `takeaway`, `counter`), `table_id` nullable, `reservation_id` nullable, `status`, `currency_code`, `subtotal_minor`, `discount_minor`, `tax_minor`, `service_charge_minor`, `rounding_minor`, `grand_total_minor`, `amount_paid_minor`, `created_by`, `shift_id`, `created_at`, `paid_at`, `cancelled_at`.
- `order_line`: `id`, `order_id`, `menu_item_id` nullable, `item_name_snapshot`, `sku_snapshot`, `unit_price_minor_snapshot`, `quantity`, `line_subtotal_minor`, `tax_class_snapshot`, `tax_rate_snapshot`, `tax_minor`, `notes`, `created_at`.
- `order_line_modifier`: snapshot of modifier name and price at sale time.
- `payment`: `id`, `order_id`, `method`, `amount_minor`, `status`, `external_reference` nullable, `recorded_by`, `created_at`, `refunded_at` nullable. `method` can include cash/manual UPI/manual card terminal/other.
- `receipt_sequence`: concurrency-safe sequence keyed by date/terminal/series as configured.
- `tax_rule`: name, rate basis points or Decimal string, inclusive/exclusive flag, effective dates, tax code/label; no default statutory rate.
- `discount_rule`: type, value, max amount, allowed roles, active window.

### Optional inventory (Phase 2)
- `inventory_item`, `recipe_component`, `inventory_movement`, `supplier` (only if procurement is later approved).
- Stock deduction should happen transactionally when an order reaches the configured committed state; void/refund reversal rules must be designed and tested.

## 3. API outline

### Public site and menu
- `GET /public/site` — published public site settings/content only.
- `GET /public/menu` — active categories and available items.
- `GET /public/menu/{category_slug}` — category details/items.
- `GET /public/menu/table/{public_token}` — menu plus safe table context.
- `GET /public/opening-hours`.

### Public booking
- `GET /public/availability?date=YYYY-MM-DD&party_size=2` — returns available slots only, no customer data.
- `POST /public/reservations` — creates one reservation request. Require rate limit and idempotency key.
- `GET /public/reservations/{public_reference}/status` — only if a secure verification mechanism is designed; a reference code alone should not expose personal data.

### Authentication/staff
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/password/change`
- `POST /auth/password/reset` only when a verified email/SMS delivery provider is configured.

### Menu/admin/content
- `GET/POST /admin/menu/categories`
- `PATCH/DELETE /admin/menu/categories/{id}` (delete means archive/deactivate if referenced)
- `GET/POST /admin/menu/items`
- `GET/PATCH/DELETE /admin/menu/items/{id}` (soft archive)
- `POST /admin/assets` — validated upload adapter.
- `GET/PATCH /admin/site-content`
- `GET/PATCH /admin/settings`

### Reservations/admin
- `GET /admin/reservations?from=&to=&status=`
- `GET /admin/reservations/{id}`
- `PATCH /admin/reservations/{id}` — status, schedule, internal note; log important changes.
- `GET/PUT /admin/booking-settings`
- `GET/POST/PATCH /admin/tables`
- `POST /admin/tables/{id}/qr/regenerate` — revokes old token and creates a new one.

### POS/orders
- `POST /pos/orders` — create draft/open order.
- `GET /pos/orders/{id}`
- `PATCH /pos/orders/{id}` — order type/table/note; enforce allowed status transitions.
- `POST /pos/orders/{id}/lines` — add line; backend resolves current item price.
- `PATCH /pos/orders/{id}/lines/{line_id}` — change quantity/modifiers/notes.
- `DELETE /pos/orders/{id}/lines/{line_id}` — remove while order is editable.
- `POST /pos/orders/{id}/recalculate` — returns server-computed totals.
- `POST /pos/orders/{id}/payments` — record tender; must be idempotent and atomic with order state transition.
- `POST /pos/orders/{id}/cancel` — permission + reason + audit event.
- `GET /pos/orders/{id}/receipt` — print-friendly receipt data or PDF adapter.
- `GET /pos/orders` — filtered order history.

### Reports/staff/audit
- `GET /admin/dashboard?date=`
- `GET /admin/reports/sales?from=&to=&group_by=`
- `GET /admin/reports/items?from=&to=`
- `GET /admin/reports/payments?from=&to=`
- `GET /admin/staff`; `POST /admin/staff`; `PATCH /admin/staff/{id}`
- `GET /admin/audit?from=&to=&actor=`
- `GET /health/live`; `GET /health/ready`

## 4. Important business rules

### Reservation capacity
- Validate cafe opening hours and blackout dates on the server.
- Validate party size, lead time and booking horizon.
- Prevent over-capacity under concurrency. A read-then-insert without transaction/locking is not sufficient.
- Define slot duration and buffer rules in settings.
- A request is `requested` unless auto-confirm is explicitly enabled and capacity is successfully committed.
- `requested` is not the same as `confirmed`.

### Order and receipt integrity
- Recalculate totals server-side from current trusted menu data and configured tax/discount rules.
- Store item/price/tax snapshots on each line at order time.
- Use database transaction for payment insert, amount-paid update, paid status and receipt sequence.
- Prevent overpayment unless split/advance payment behaviour is explicitly supported.
- Idempotency key prevents double payment capture/recording from retries.
- Void/refund is a new audited action; do not delete the original order/payment history.
- Receipt reprint must not create another sale.

### Tax/charges
- Tax configuration must support inclusive/exclusive modes and effective dates, but no jurisdiction rate should be assumed.
- Tax/charge calculation and rounding policy must be documented and unit-tested.
- Do not label a receipt as a legally compliant tax invoice until the owner supplies verified registration details and receives professional approval.

### Offline/outbox
- Every offline mutation has `idempotency_key`, `client_created_at`, entity reference and payload version.
- Server stores processed idempotency keys and response for safe retry.
- On sync, server revalidates menu price, availability and staff permissions.
- If a menu item price or availability changed, return a conflict requiring cashier review.
- UI displays `Pending sync` until server acknowledges.
- No silent overwrite of conflicting records.

## 5. Security and operational requirements

- Public routes are read-only except reservation submission; aggressively limit booking submissions.
- Admin/POS APIs require role checks on every endpoint.
- CORS allowlist must contain exact deployed website origins.
- HTTPS required in hosted deployment.
- Secrets only in environment variables/secret manager.
- Password hash Argon2id or bcrypt.
- Cookie sessions: HttpOnly, Secure in production, SameSite configured; CSRF token for mutations.
- Rate limit login, password reset, reservation submissions, asset uploads.
- Limit asset MIME type and file size; rename to generated identifiers; scan where available.
- Database constraints and transactions protect unique receipt numbers, references, and capacity.
- Audit menu price, tax settings, discounts, voids/refunds, staff roles and booking changes.
- Logs redact tokens, passwords, payment credentials and customer contact fields.
- Health endpoints must not expose secrets or detailed database connection strings.

## 6. Environment variables (illustrative)

```dotenv
APP_ENV=development
APP_SECRET_KEY=change-me-in-local-only
DATABASE_URL=sqlite:///./data/cafe_local.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
PUBLIC_SITE_URL=http://localhost:5173
PUBLIC_BOOKING_ENABLED=false
BOOKING_AUTO_CONFIRM=false
CAFE_TIMEZONE=Asia/Kolkata
DEFAULT_CURRENCY=INR
MEDIA_STORAGE=local
LOCAL_MEDIA_PATH=./data/media
SESSION_COOKIE_SECURE=false
LOG_LEVEL=INFO
```

Production values must use secure secrets, deployed database URL, HTTPS origin list, durable media storage, and tested backup configuration. Never commit a real `.env` file.

## 7. Migration and backup approach

- Use Alembic migrations for all schema modifications.
- Test migrations against clean SQLite and PostgreSQL databases.
- Local SQLite backup should use SQLite's backup API or a safe consistent backup method, not copy a live DB file during writes without coordination.
- Hosted PostgreSQL backups must be automatic and exported to a separate storage/account where feasible.
- Document retention, encryption, access permissions and restore procedure.
- A release must not run destructive migrations without a verified backup and rollback plan.
