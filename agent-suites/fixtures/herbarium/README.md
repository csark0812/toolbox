# Herbarium

The pressed-plant collection at the Marlow Natural History Society, being typed up from the old ledgers by volunteers. `data/specimens.json` has one entry per sheet: the accession number as it's written on the sheet, the taxon, the collector, and the date it was collected (`YYYY-MM-DD`, or `null` when the label doesn't say).

Accession numbers look like `HB1923/417-7`: `HB`, the year the sheet was accessioned, a slash, the sheet's serial number within that year, a hyphen and a check character. The ledgers were copied by hand more than once, so some numbers on the sheets are wrong.

## Usage

```
npm run specimens   # every sheet
npm test
```
