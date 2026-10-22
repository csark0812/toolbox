# Yarn stock

Cost of sales and closing stock for a small wool shop, for the accounts and the reorder list. The stock book in `data/books.json` has every delivery (`purchases`: a lot of one yarn, `qty` balls bought for `pence` in all) and every sale (`sales`: `qty` balls of one yarn).

`costOfSales(purchases, sales)` in `src/fifo.mjs` works through the year in date order, first in first out:

- A sale takes balls from the oldest lots of that yarn delivered on or before the sale date; a delivery on the same day is on the shelf in time. Rows on the same date keep the order they were entered in.
- A lot is paid for as a whole, so its balls are costed cumulatively (`costOfFirst`): the first `n` balls of a lot cost `Math.round(pence * n / qty)`, and once a lot is used up its balls have cost exactly what was paid. No averaging.
- If there aren't enough balls, the sale is costed on what there was and `short` says how many were missing. A shortfall isn't filled from later deliveries.
- Closing `stock` is one line per yarn ever bought, by SKU: balls left and their cost.

The result has `sales` (in the order given: `id`, `sku`, `cost`, `short`) and `stock`.

The till's back-office page holds the stock book in memory, edits rows in place when a delivery note or a sale is corrected, and calls `costOfSales` again with the same arrays. It relies on the arrays being left exactly as they were.

## Usage

```
npm run books   # costs data/books.json
npm run perf    # times the costing on a year of the shop's books
npm test
```
