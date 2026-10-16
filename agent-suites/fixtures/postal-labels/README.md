# Postal labels

Address labels, courier manifests and return slips for our mail-order pottery shop. Orders waiting to ship are in `data/shipments.json`.

- `npm run labels -- --preset <envelope|customs|csv|sms>` prints one formatted address per shipment.
- `npm run labels -- --manifest` prints the courier's CSV manifest.
- `npm run labels -- --slip <order id>` prints the return slip from `templates/return-slip.txt`.

`npm test` runs the tests.
