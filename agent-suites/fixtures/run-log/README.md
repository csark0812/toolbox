# Run log

A personal running log. Runs live in `data/runs.json` (distance in metres, time in seconds); `data/profile.json` picks kilometres or miles.

```
npm run runs -- summary [--units km|mi]     totals and the longest run
npm run runs -- splits <run id> [--units km|mi]
npm run runs -- weekly [--units km|mi]      the weekly email, from templates/weekly.txt
npm run runs -- share <run id> [--units km|mi]
```

`npm test` runs the tests.
