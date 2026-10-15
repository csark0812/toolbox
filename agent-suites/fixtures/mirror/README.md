# Mirror

Copies the files listed in `data/manifest.json` to the asset store, a few at a time, and prints a summary.

`npm test` runs the tests. `npm run sync` runs a sync against the local stand-in for the asset store (`src/store.mjs`), which replays today's outage list from `data/outages.json`.
