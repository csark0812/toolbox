# Zine distro

Wholesale orders for our little zine distribution: independent bookshops order copies of the zines we carry, and we pack and invoice them once a month. `data/orders.json` holds the month's orders.

- `npm run picklist [-- --sort sku|qty|title]` prints how many copies of each zine to pull off the shelves (default sort: sku).
- `npm run invoice -- <order id>` prints a shop's invoice.
- `npm run export -- <order id>` prints the order as CSV for the shop's own stock system.
- `npm run import -- <csv> [--save]` reads a re-order sheet a shop sent us (columns `order,sku,qty`), shows the updated pick list and, with `--save`, adds the lines to `data/orders.json`.

Shops' re-order sheets and their stock systems use the column name `qty`, and the warehouse volunteers are used to `--sort qty`; neither can change. `npm test` runs the tests.
