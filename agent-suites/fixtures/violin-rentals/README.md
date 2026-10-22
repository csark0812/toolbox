# Violin rentals

The rental API for Hartley Strings, a music shop that rents violins, violas and cellos to families. Customers sign in to rent an instrument and see their rentals; the shop counter signs in to record payments. `data/instruments.json`, `data/customers.json` and `data/rentals.json` hold the shop's records. Dates are `YYYY-MM-DD` and amounts are whole pence.

Rules for every endpoint:

- A request needs a signed-in session (`customerId` or `staffId`); otherwise it gets 401.
- A customer only ever sees or changes their own rentals. Anyone else's rental is answered with 404, exactly as if it didn't exist.
- An instrument is out until it comes back. A rental that is `active`, or `overdue` because the rent is late, still has the instrument, and nobody else can rent it.
- Rent is paid monthly in advance. Each payment covers 30 days and moves `paidUntil` (the first day not paid for) on by 30 days. Only the shop records payments.
- The minimum term is three months. Returning an instrument during the first three months refunds no rent. After that, returning it early refunds the unused days of the month already paid for: `monthlyPence × (days from the return date up to paidUntil) ÷ 30`, rounded down to whole pence.
- The deposit is refunded in full when the instrument comes back.
- The return date is the day the shop receives the instrument, which is `request.today`.

`src/api.mjs` routes requests to the handlers; `request.body` is the request's JSON body as parsed by `JSON.parse`, and `request.today` is the date the request arrives. `npm test` runs the handler tests.
