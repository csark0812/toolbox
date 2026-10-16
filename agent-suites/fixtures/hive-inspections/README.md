# Hive inspections

Inspection log for the Ashgrove apiary. `data/inspections.csv` is typed up from the paper log book in the shed, so dates are written the way the beekeepers write them: `DD/MM/YYYY`.

Each colony should be opened at least every 14 days during the season. A hive is overdue when its most recent inspection was more than 14 days before today.

## Usage

```
npm run overdue                       # hives overdue as of today
npm run overdue -- --today 2026-11-03 # as of another day
npm run history -- 4                  # every inspection of hive 4
npm test
```
