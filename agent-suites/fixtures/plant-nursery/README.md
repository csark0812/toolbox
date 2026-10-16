# Plant nursery

Stock control for Fernhill Nursery's plant sales area. `data/stock.csv` holds each line: SKU, plant, supplier, plants in stock, reorder level, target stock, how many plants come in a supplier's tray, the price per tray in pence, and whether the line is discontinued. `data/deliveries.json` lists deliveries already ordered and on their way.

## Reordering

A line needs reordering when the plants in stock plus any pending delivery for that SKU are at or below its reorder level. Order enough whole trays to bring it back up to at least its target. Suppliers only sell whole trays. Discontinued lines are never reordered; we sell what is left.

## Usage

```
npm run stock   # every line with its stock value
npm test
```
