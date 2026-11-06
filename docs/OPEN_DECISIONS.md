# Open owner decisions

No real cafe-specific business details have been supplied yet. Values shown in the current site are concept/demo content and must not be treated as verified operating data.

## Needed before publishing real customer information

| Decision | Owner input needed | Safe interim behavior |
|---|---|---|
| Cafe identity | Approved public name, logo, tagline, and brand assets | Keep the current name and assets clearly marked as a working concept |
| Contact and venue | Address, phone, email, map link, social links, and public contact preference | Show placeholders; do not publish invented details |
| Opening hours | Local opening hours, split shifts, holiday/closure process | Do not show sample hours as real |
| Menu | Categories, item names, descriptions, photos, availability, dietary/allergen notes | Keep demo menu labelled; do not imply availability |
| Pricing and tax | Currency confirmation, prices, tax classification/rates, service charge and rounding rules | Do not show made-up prices or calculate a payable total |
| Reservations | Whether requests are accepted; hours, slot interval, capacity, lead time, party limits, confirmation and cancellation rules | Keep online booking disabled until a reachable API and approved policy exist |
| Staff operations | Roles, cashier workflow, shift tracking, discounts, void/refund permissions, receipt sequence and wording | Do not expose payment/POS controls as operational |
| Data and hosting | Hosting provider, deployment mode, database owner/location, backup destination and recovery contact | Develop locally; do not store production data on an ephemeral filesystem |
| Privacy and legal | Legal business details, privacy/terms wording, retention periods and customer-data access rules | Keep legal pages unpublished until owner/legal review |
| Integrations | Approved payment, email/SMS, maps or analytics providers and credentials | Keep integrations disabled; never add credentials to source control |

## Reference-site use

The kit names [Oak Hill Café & Farm](https://oakhillcafe.webflow.io/) as a visual/structure reference. Adapt only broad information-architecture patterns: clear menu groupings, a visible reservation or visit action, and easy-to-find hours/location/contact information. Do not reuse its identity, wording, photography, menu, hours, address, or operating policies.

## Decision process

Record the owner's answer and date here when a decision is made. Update the product spec or API contract if the answer changes product behavior. Until then, follow the safe interim behavior above.
