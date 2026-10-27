# Sailing school

Bookings for the Kestrel Water sailing school's weekend courses. `data/courses.json` lists the courses with their start date and price in pence; `data/bookings.json` holds the bookings.

Rules:

- A booking is `unpaid` until the member pays at the boathouse, then `paid`. A cancelled booking is `cancelled`.
- Members see and change only their own bookings. Anyone else's booking answers 404, as if it did not exist.
- Refunds: cancelling 7 or more days before the course starts refunds the full price, fewer than 7 days refunds half, and on or after the start day nothing. Only money actually paid is ever refunded.
- Dates are UK dates written `YYYY-MM-DD`.

`src/api.mjs` has the request handlers; each takes the request, the signed-in session and the store. `npm test` runs the tests.
