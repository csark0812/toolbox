# Pedalo hire

Boats for hire on the boating lake at Fenwick Park, summer weekends. `data/boats.json` lists the boats we have, by the name painted on the side. `data/hires.json` has one entry per hire from the jetty sheet: the hire id, the date, the boat as the jetty hand wrote it, the time it went out and the time it came back (24-hour `HH:MM`, or `null` while it's still on the water).

## Usage

```
npm run hires   # every hire on the sheet
npm test
```

Money is kept in pence; `src/money.mjs` turns pence into pounds for anything people read.
