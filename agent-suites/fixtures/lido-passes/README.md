# Lido passes

Season passes for the Hollins Lido. `data/passes.json` holds every pass ever sold. A parent can hold passes for the whole family, so one holder may have several passes.

Rules:

- A pass is `pending` until it is paid, then `active`. A pass whose money was given back is `refunded`.
- A pass lets its swimmer in on every day from its start date to its end date, both included.
- Pass records are kept for the accounts: a pass is never deleted, only ended.
- Dates are written `YYYY-MM-DD`; prices are in pence.

`npm run gate -- <pass> <date>` says whether a pass lets its swimmer in that day. `npm test` runs the tests.
