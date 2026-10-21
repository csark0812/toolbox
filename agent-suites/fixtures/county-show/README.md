# County show

Results, prizes and entry fees for the Ashby & District Show, held at Ashby Rec. `data/classes.json` is the schedule, `data/exhibitors.json` has each exhibitor's village, age and whether they've paid their fees, `data/entries.json` says who entered what, and `data/points.csv` is the points each entry was given, typed up from the stewards' sheets.

The highest points in a class wins. Prize money is £3 for 1st, £2 for 2nd and £1 for 3rd.

Entries are 50p each. Juniors, 15 and under, enter free.

## Usage

```
npm run results   # placings for every class
npm run prizes    # prize money for each exhibitor
npm run fees      # entry fees, and who has paid
npm test
```
