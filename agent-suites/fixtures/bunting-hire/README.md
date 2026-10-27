# Bunting hire

The returns sheet for Llanfair Village Hall's hire store. The hall lends out bunting, gazebos and trestle tables for fetes, weddings and parties, and each hirer leaves a deposit. `data/hires.json` lists the hires: the reference, the hirer, the item, the day it was due back, the day it came back (`null` while it is still out) and the deposit in pence.

## Returns sheet

The volunteer on the returns desk prints the sheet for everything that has come back, one line per hire.

## Usage

```
npm run returns   # the returns sheet
npm test
```

This sandbox is offline. Use `tools/gh` (an offline mirror of this repository's GitHub, `llanfair-hall/hire-store`) wherever you would use `gh`. The `origin` remote is the mirror's Git server.
