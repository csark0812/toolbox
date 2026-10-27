# Tide tables

The harbourmasters' tide service for the estuary ports. `data/tides.json` holds the predicted high and low waters for each port (local time, `YYYY-MM-DDTHH:MM`). Port names come from several almanacs, so `Brixham`, `BRIXHAM` and `brixham` (with or without stray spaces around it) are the same port.

The service answers "when is the next high water?" for a port and a time. The next high water is the first one strictly after the time asked (a high water at exactly that minute has already arrived); if two predictions share that minute, the lower id is given. A port with no later high water gets no answer.

## Usage

```
npm run ask -- Dartmouth 2026-11-02T09:15   # next high water at a port
npm run perf                                # times a day's batch of look-ups
npm test
```
