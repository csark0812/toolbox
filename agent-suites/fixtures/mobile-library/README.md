# Mobile library

Timetable and reservations for the Fenland mobile library van. The van runs a two-week cycle: some stops are visited every week, others only in week A or week B (week A is an even ISO week). `data/stops.json` lists the stops with their day, arrival time and how long the van stays; `data/holds.json` lists the reserved books waiting on the van for a borrower to collect at their stop.

## Usage

```
npm run van -- run Tue A               # Tuesday's run sheet in week A
npm run van -- run Tue A --format csv  # the same, for the driver's tablet
npm run van -- stop ST07 2026-10-21    # a stop's next visit and the holds waiting there
npm run van -- holds 2026-10-21        # every hold, by the van's next visit to its stop
npm run van -- week 2026-10-21         # the week's days at a glance
npm test
```
