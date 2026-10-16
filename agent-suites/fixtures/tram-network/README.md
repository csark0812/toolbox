# Tram network

Journey planning for the city tram map. A network is a list of stops and directed links between them, each link with its travel time in minutes. `fastestRoute(network, from, to)` returns the quickest route as `{ minutes, stops }` (the stop ids from start to end), or `null` when the destination cannot be reached. Asking for a stop that is not on the map is an error.

`npm run route -- <from> <to>` plans a journey on `data/network.json` by stop name. `npm run perf` times a batch of journeys on a large synthetic network and prints one JSON line. `npm test` runs the tests.
