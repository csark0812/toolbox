# Bridge counter

Daily figures for the automatic counter on the Mill Lane footbridge. The counter uploads one reading per hour: `{ "at": "2026-03-29T09:00:00+01:00", "count": 41 }`.

`dailyReport(readings)` in `src/report.mjs` gives one row per day, from the first day with a good reading to the last, with gap days included:

- `day`, `total` (people crossing that day), `hours` (how many hours have a count) and `peakHour` (the busiest hour; the earliest one on a tie, `null` for a day with no counts).
- `rolling7`: the average daily total over the seven days ending that day, counting only days that have at least one count, rounded to one decimal place (`null` if none of the seven has any).

Things the counter does that the report copes with:

- Times carry the counter's own offset, which switches to `+01:00` for summer time. Days and hours are UTC.
- A sensor fault is uploaded as `"count": null` (or left out) or as a negative number; those readings are ignored. A count of 0 is a real count.
- After a dropout the counter sometimes uploads an hour again; the later upload in the file replaces the earlier one.
- Uploads after a dropout arrive late, so the file isn't in time order.

## Usage

```
npm run report   # the report for data/counts.json
npm run perf     # times the report on a season of uploads
npm test
```
