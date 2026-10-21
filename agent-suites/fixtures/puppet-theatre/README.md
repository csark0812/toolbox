# Puppet theatre

Box office for the Lantern Puppet Theatre: 36 seats in six rows (A–B front, C–D middle, E–F back), three ticket types (adult, child, concession) and a season setting that scales prices (standard, panto, schools).

`data/bookings.json` holds the bookings made so far, by show. `data/reports.json` lists the sections of the end-of-day report, in order.

## Usage

```
npm run quote -- C4 --type child --season panto       # what a seat costs
npm run book -- --show "Sat 14:00" --seat C4 --type child   # check a seat is free and price it
npm run report -- --season panto                      # the end-of-day report
npm test
```

Prices are in pence and rounded to the nearest 5p. A concession is £3 off the adult price but never below £5.
