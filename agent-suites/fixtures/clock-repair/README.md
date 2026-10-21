# Clock repair

Job book for Tick & Chime, a clock and watch repair workshop.

- `data/jobs.json` is written by the booking tablet on the front counter, one record per job.
- `config/shop.json` holds the surcharges and turnaround times; the accounts spreadsheet reads it too.

## Usage

```
npm run queue                         # the bench queue, rush jobs first
npm run queue -- --urgent             # rush jobs only
npm run queue -- --date 2026-10-20    # as of a given day, with overdue jobs marked
npm run invoice -- J-1042             # the invoice for one job
npm run export                        # CSV for the insurer's claims system
npm test
```

All the commands take `--file` to read another job book. The insurer imports the export as it is, by column name.
