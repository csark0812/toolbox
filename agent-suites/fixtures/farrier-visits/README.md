# Farrier visits

The diary for Tom Ashby, farrier. `data/horses.json` lists every horse on the round: its owner, the yard it lives at, what it wears on its feet and when it was last seen. `data/visits.json` is the record of past visits and whether each one has been paid. `data/yards.json` has the yards, with their addresses and gate codes.

## Intervals

- A horse in shoes, a full set (`"shoes": "all"`) or fronts only (`"shoes": "front"`), is seen every six weeks.
- A barefoot horse (`"shoes": "none"`) is trimmed every eight weeks. Youngsters that have never been shod have no `shoes` field at all and are on the barefoot interval too.

## Prices

| Work                     | Price |
| ------------------------ | ----- |
| Trim (barefoot)          | £35   |
| Front shoes, trim behind | £65   |
| Full set                 | £95   |

## Yards

Long Lane Stables, Hussain's Yard and Ridge Farm. Directions are in `docs/directions.md`.

## Usage

```
npm run round   # every horse's next visit, with the price
npm run owed    # visits that haven't been paid yet
npm test
```
