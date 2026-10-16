# Ferry sailings

Bookings for the island ferry. Each sailing has a car deck with a fixed number of car spaces and a passenger lounge with a fixed number of seats. A car booking takes one car space and a seat for everyone in the car; a foot booking takes a seat per passenger. Bookings are first come, first served: a request that does not fit is refused and takes nothing.

`src/booking.mjs` is shared with the booking website, which calls `book()` for each request as it arrives, so several bookings are often in flight at once. The sailing store stands in for the database: every read and write is asynchronous.

`npm run import -- <requests.json>` books a batch of requests sent over by the travel agents (in the order they were received) and prints the outcome and the resulting load of each sailing. `npm test` runs the tests.
