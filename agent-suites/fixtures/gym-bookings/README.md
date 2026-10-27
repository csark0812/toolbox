# Gym bookings

The class booking API for Ashcombe Leisure Centre. Members sign in to book group classes; front-desk staff sign in to see who is coming. `data/classes.json`, `data/members.json` and `data/bookings.json` hold the centre's records. Times are `YYYY-MM-DDTHH:MM` and are treated as UTC throughout.

Rules for every endpoint:

- A request needs a signed-in session (`memberId` or `staffId`); otherwise it gets 401.
- A member only ever sees or changes their own bookings. Anyone else's booking is answered with 404, exactly as if it didn't exist.
- A class never has more booked members than its `capacity`. The reformer studio has four beds and the spin studio twelve bikes, so this is a hard limit.
- A member holds at most one place in a class.
- Members' phone numbers and email addresses are only shown to staff, on the class roster.
- Cancelled bookings stay in `bookings.json` with `status: "cancelled"`.

`src/api.mjs` routes requests to the handlers; `request.body` is the request's JSON body as parsed by `JSON.parse`. `npm test` runs the handler tests.
