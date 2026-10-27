# Orchard harvest

Pickers' weigh-ins for Long Meadow Orchard. Every crate is weighed at one of the two scales and the reading is exported to `data/weighins.csv`: the time, the picker, the apple variety, the weight in kg and which scale. Scale A is the old one in the packing shed; scale B is the new one in the cider barn and exports from its own software.

A row with no weight is a tare reading (an empty crate) and does not count.

Pickers are paid 30p per kg.

## Usage

```
npm run totals -- 2026-10-10   # each picker's kg and pay for the day
npm test
```
