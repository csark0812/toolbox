# Campsite pitches

The booking API for Hollowmere Farm Campsite. Guests sign in to book pitches; the site office signs in to see the week's arrivals. `data/pitches.json`, `data/guests.json` and `data/bookings.json` hold the site's records. Dates are `YYYY-MM-DD`, and a booking covers the nights from `arrive` up to, but not including, `depart`.

Rules for every endpoint:

- A request needs a signed-in session (`guestId` or `staffId`); otherwise it gets 401.
- A guest only ever sees or changes their own bookings. Anyone else's booking is answered with 404, exactly as if it didn't exist.
- A pitch takes one booking a night. Departure day is changeover day: one party can leave a pitch on the morning another arrives.
- A pitch costs its `nightlyPence` for each night, and the deposit is 20% of the total, rounded down to whole pence. Only the office records payments.
- Cancelling 14 days or more before the arrival date refunds the deposit in full; a later cancellation refunds nothing.
- Cancelled bookings stay in `bookings.json` with `status: "cancelled"`.

`src/api.mjs` routes requests to the handlers; `request.body` is the request's JSON body as parsed by `JSON.parse`, and `request.today` is the date the request arrives. `npm test` runs the handler tests.
