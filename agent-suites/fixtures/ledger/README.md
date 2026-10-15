# Ledger

`reconcile(entries, statement)` matches bank statement lines to ledger entries: same reference (ignoring case, punctuation and leading zeros), same amount, dates at most 3 days apart. Each statement line, in order, takes the closest-dated unused entry (lowest id on a tie).

`npm test` runs the tests. `npm run perf` reconciles a month-end-sized statement and prints JSON timings.
