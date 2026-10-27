# Fix-it evenings

Records from the Northgate fix-it evenings, where volunteers mend things people bring in.

`data/items.csv` lists every item brought in this year, with one final outcome each:

- `fixed`: mended and returned. Some were fixed on a later evening after we ordered a part (`part_ordered` is `yes`).
- `not-fixable`: we could not mend it, sometimes even after ordering a part.
- `awaiting-part`: a part is on order and the item is still with us.
- `taken-home`: the owner took it home before we finished.

## Usage

```
npm run summary   # outcome counts for the annual report
npm test
```
