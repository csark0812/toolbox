# Parcel lockers

The parcel lockers outside our two community centres. Couriers drop parcels into a locker and the recipient gets a text with a code; `data/parcels.json` records when each parcel was delivered and, once it has been picked up, when it was collected. Times are UTC.

## Usage

`npm run status -- --at <time>` lists the lockers that are occupied at that time, with the parcel and how long it has been there.

`npm test` runs the tests.

This sandbox is offline. Use `tools/gh` (an offline mirror of this repository's GitHub, `northside-hub/parcel-lockers`) wherever you would use `gh`. The `origin` remote is the mirror's Git server.
