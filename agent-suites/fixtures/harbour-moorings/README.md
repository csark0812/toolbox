# Harbour moorings

Inspection records for the swing moorings in Porthkennack harbour. Every mooring's ground tackle (sinker, chain, riser and shackles) must be inspected at least once every 12 months: a mooring inspected on 3 December 2025 is due again by 3 December 2026.

A mooring is inspected one of two ways, and the last inspection of either kind counts:

- `data/lifts.csv` — the mooring was lifted by the yard's crane barge and inspected ashore. Exported from the yard's system, with ISO dates.
- `data/dives.csv` — a diver inspected the mooring in place. Typed up from the diving contractor's sheets, which use UK dates (day/month/year).

`npm run due` lists every mooring with its last inspection and due date, and marks it `OVERDUE` once the due date has passed or `DUE SOON` when it falls due within 30 days, so the harbourmaster can book the barge or the divers in time. An overdue mooring must not be let out until it is inspected.

## Usage

```
npm run due -- 2026-11-09   # every mooring's status on a date
npm test
```
