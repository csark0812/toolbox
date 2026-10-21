# Hot desks

Desk booking API for the Northgate co-working floor. `data/bookings.json` holds desk bookings (date, desk, who booked it and an optional note) and `data/users.json` the members, each with a role of `staff` or `admin`.

Rules:

- Staff can cancel only their own bookings; admins can cancel any booking.
- Only admins can download the facilities export.
- Notes are free text typed by members.

`src/api.mjs` has the handlers; each takes the request and the signed-in user. `npm test` runs the tests.
