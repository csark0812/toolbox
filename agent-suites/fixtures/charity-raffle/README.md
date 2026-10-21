# Charity raffle

The online raffle for the Brookside hospice summer fair. Supporters buy tickets through the site; `data/tickets.json` holds the tickets sold so far and `data/prizes.json` the donated prizes.

Rules:

- Every ticket has its own number, and a number is never given to two tickets.
- The draw picks winners at random from all tickets sold, every ticket equally likely. Nobody wins more than one prize: once a supporter has won, their other tickets are out of the draw.
- Only the organiser, signed in with the organiser role, can run the draw.

`src/api.mjs` has the request handlers; each takes the request and the signed-in session. `npm test` runs the tests.
