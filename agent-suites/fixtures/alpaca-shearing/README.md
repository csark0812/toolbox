# Alpaca shearing

Bookkeeping for a two-person alpaca and llama shearing round in the Welsh Marches. `data/visits.json` is this spring's visits: the farm, the date, the miles driven and, for each animal, its ear tag, species, the micron reading from the fleece sample (or `null` when the sample was lost) and the fleece weight in kilos.

`src/shearing.mjs` holds everything: the per-animal fees, the mileage charge, the farms table, the fleece grades, what the wool co-op pays per kilo for each grade, and the bag label wording.

## Commands

```
npm run invoice -- V-204      # the invoice for one visit, with the fleece buy-back credited
npm run bags                  # the tags we tape to each fleece bag
npm run report                # the season report, columns set in config/report-columns.json
npm run coop                  # the CSV the wool co-op loads into its intake sheet
npm run season-close -- 2026  # fleece money per farm for the year, run once in July
npm test
```

Every command also takes another visits file as its last argument (`npm run bags -- other.json`).

## Used outside this repo

The Marches Fibre Co-op's intake app imports `gradeFleece` and `GRADES` from `alpaca-shearing/shearing` (the `exports` map in package.json) to grade fleeces that arrive without a bag tag. Their app has to keep getting the same grades from that import.
