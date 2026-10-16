# Seats

Seat booking for a small theatre. Shows, seats and tickets live in a key-value store that is reached over the network (`src/store.mjs` simulates the latency). Card payments are held when a seat is booked and released on cancellation.

`npm test` runs the tests.
