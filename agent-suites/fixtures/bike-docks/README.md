# Bike docks

Live status of the docking stations in our town's bike share, for the operations team. `data/docks.json` is the latest snapshot from the docks: each bike is `ok`, `broken` (reported by a rider) or `maintenance` (waiting for the van).

`npm run docks -- status` prints each dock with the bikes a rider can take and the free spaces to return one. `npm test` runs the tests.
