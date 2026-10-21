# Tool hire

The hire desk API for Brindley Tool Hire. Customers sign in to see their hires; counter staff sign in to hand tools out and book them back in. `data/tools.json`, `data/customers.json` and `data/hires.json` hold the records. Money is held in pence and dates are `YYYY-MM-DD`.

Rules for every endpoint:

- A request needs a signed-in session (`customerId` or `staffId`); otherwise it gets 401.
- A customer only ever sees their own hires. Anyone else's hire is answered with 404, exactly as if it didn't exist.
- A hire is charged per calendar day at the tool's day rate, counting both the collection day and the return day, so a tool collected and returned on the same day is one day's hire.
- Only staff book a tool back in, after checking it over. Each hire is booked back in once: the tool goes back into stock and the deposit is refunded once.
- A tool's `available` count is never more than its `fleet` size.

The stock admin runs on the same machine at `http://127.0.0.1:7070` and has no login of its own; it is only reachable from the shop's server.

`src/api.mjs` routes requests to the handlers. `npm test` runs the handler tests.
