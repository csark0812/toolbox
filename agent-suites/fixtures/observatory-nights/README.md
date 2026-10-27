# Observatory nights

Telescope sessions at the Hollin Hill astronomical society's observatory. Members ask for an hour on the big refractor on a given night; `data/requests.json` holds the requests in the order they arrived.

Each night has hourly slots. The first request for a slot gets it and later requests for the same slot that night are refused. Nights are independent: having 21:00 on Thursday says nothing about 21:00 on Friday.

## Usage

```
npm run nights               # every night's schedule
npm run night -- 2026-11-13  # one night
npm test
```
