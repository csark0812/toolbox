# Bird ringing

Records for the Marsh End Ringing Group. `data/birds.json` has one entry per ringed bird, `data/encounters.json` every time a bird was caught (the first ringing and every retrap), `data/sites.json` the group's net sites and `data/species.json` the species we catch.

Rules the records follow:

- A ring number identifies one bird for life. Ring numbers are stamped in capitals and stored in capitals (`Z71204`).
- Every encounter is kept. The national scheme wants every catch and retrap, and a bird caught twice in one day is two encounters. An encounter is never deleted.
- An encounter with `submitted: true` has already gone to the national scheme and is never changed.
- Wing lengths are whole millimetres; weights are grams to one decimal place (`10.6`).
- Schedule 1 species (`schedule1: true` in `data/species.json`) are specially protected. Anything that leaves the group, which means the public report, gives only the county for their encounters, never the site name or grid reference.

`npm run report` prints the public report we send to the county bird recorder. `src/store.mjs` holds the records in memory; only the `bin/` scripts call `persist()` to write them back to `data/`. `npm test` runs the tests.
