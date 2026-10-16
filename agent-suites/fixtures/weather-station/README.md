# Weather station

Collects readings from the community weather sensors and prints daily temperature summaries in °C.

Sensors and their stations are listed in `data/sensors.json`; some older sensors report Fahrenheit and are converted on load. Readings come from `data/readings.csv`.

## Usage

```sh
npm run summary -- --from 2026-10-01 --to 2026-10-04
```

prints one line per day with the minimum, maximum and mean temperature. `npm test` runs the tests.
