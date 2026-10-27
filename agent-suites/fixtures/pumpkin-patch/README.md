# Pumpkin patch

Pick-your-own pumpkins at Hollow Lane Farm. Pumpkins are sold by weight, at a rate per kilo for each variety (carving, giant, munchkin, crown), rounded to the nearest 10p.

- `npm run till -- giant 13 carving 4.2` prices pumpkins on the scale at the barn till.
- `npm run receipts` reprints the receipts for the day's sales in `data/sales.json` (`--file` for another day).
- `npm run online` prices the click-and-collect orders in `data/orders.json` (`--file` for another batch).
- `npm run board` prints the price board that goes on the barn wall.
- `npm test`

The farm's web shop installs this package and prices baskets with `quoteOrder` from `pumpkin-patch/orders`.
