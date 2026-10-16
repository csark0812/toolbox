# Bus board

The departure screens at the stops on the town's three bus routes. `data/timetable.json` has every departure and `data/stops.json` the stops with their screens.

`npm run board -- <stop id> --at <HH:MM>` prints what a stop's screen shows at that time: the next six departures, as `due`, minutes away, or a clock time for anything more than a quarter of an hour off. `npm test` runs the tests.
