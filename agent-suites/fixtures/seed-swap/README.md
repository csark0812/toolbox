# Seed swap

The catalogue for our allotment society's seed library. Members donate packets of seed they saved and take packets for the season. The catalogue lives in `data/seeds.json`.

```
npm run seeds -- find <text>                                  varieties whose name contains the text
npm run seeds -- family <family>                              everything in a plant family
npm run seeds -- add <variety> <family> <donor> <year> <packets>
npm run seeds -- take <variety> <packets>                     record packets taken out
npm run seeds -- report                                       stock by family, oldest seed first
npm run seeds -- labels                                       packet labels for the sorting table
```

Seed older than three seasons is flagged in the report, as it may not germinate well. `npm test` runs the tests.
