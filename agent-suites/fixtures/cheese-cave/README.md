# Cheese cave

Ageing records for the wheels in the Hollow Lane cave. The dairy's stock system exports `data/wheels.json` each morning: one record per wheel, with the make batch it came from, the cheese, the make date, how many times it has been turned, its weight and sometimes a note. We don't edit that file; the dairy regenerates it.

A wheel is ready once it has aged its cheese's minimum (Tomme 90 days, Cheddar 270, Blue 60, Washed 45).

Every command takes `--file <path>` (default `data/wheels.json`) and `--date <YYYY-MM-DD>` (default today).

## Usage

```
npm run status                          # each batch: wheels and how many are ready
npm run status -- --batch B-17          # the wheels in one batch
npm run labels                          # shelf labels for the ready wheels
npm run labels -- --json                # the same, as JSON for the label printer
npm run card -- W-104                   # everything we hold on one wheel
npm test
```
