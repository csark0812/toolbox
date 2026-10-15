# Shipping

Parcel shipping quotes in cents. The billable weight is the larger of the actual weight and the volumetric weight (L x W x H / 5000), rounded up to the next half kilo.

- `src/rates.mjs` — `quote()` and the zone rate table
- `src/cart.mjs` — checkout quote for a cart
- `src/labels.mjs` — label text for the warehouse printer
- `src/import.mjs` — bulk quotes from a carrier CSV export
- `bin/quote.mjs` — `npm run quote -- <kg> <l> <w> <h> <zone> [express]`

`npm test` runs the tests.
