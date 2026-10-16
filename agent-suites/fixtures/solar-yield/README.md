# Solar yield

How much the roof panels at the community hall generate. A logger reads the export meter (a running total in kWh) just before midnight each day and appends it to `data/meter.csv`. The logger sometimes misses a night when the Wi-Fi drops.

- `npm run yield -- <YYYY-MM>` prints the month's generation.
- `npm run daily -- <YYYY-MM>` prints the generation for each logged day.

`npm test` runs the tests.
