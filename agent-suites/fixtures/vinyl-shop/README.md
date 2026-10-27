# Vinyl shop

Stock for Groove Exchange, a second-hand and new vinyl shop with a back-room warehouse. `data/stock.csv` has one row per record per location (`shop` or `warehouse`) with the number of copies there.

`npm run stock` is the Monday reorder sheet. It counts each record's copies across the shop and the warehouse, lists records that are sold out everywhere, and flags records with 2 or fewer copies left as low stock so they can be reordered.

## Usage

```
npm run stock   # the reorder sheet
npm test
```
