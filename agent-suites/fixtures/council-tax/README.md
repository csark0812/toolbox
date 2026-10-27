# Council tax

The resident portal for Harrowfield District Council's council tax. Residents sign in with the account reference from their bill and their postcode to see what they owe for the 2026/27 charge year (1 April 2026 to 31 March 2027). `data/accounts.json` holds the accounts. Money is held in pence and dates are `YYYY-MM-DD`.

Rules for every endpoint:

- A request needs a signed-in session (`accountRef`); otherwise it gets 401. A resident only ever sees or changes their own account.
- The year's charge is paid in ten monthly instalments, due on the 1st of each month from April to January.
- Changes to a bill are pro rata by day, counting the day the change takes effect.
- Money is never lost or invented: any credit that cannot come off an instalment still to be paid is refunded to the resident.
- The portal only ever sends residents to pages on the council's own site. Scam letters and texts that imitate the council are common, so a link that starts on our site must not be able to land a resident anywhere else.

`src/api.mjs` routes requests to the handlers. `npm test` runs the handler tests.
