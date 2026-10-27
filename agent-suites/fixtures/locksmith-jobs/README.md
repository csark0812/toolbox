# Locksmith jobs

The customer portal API for Keyway Locksmiths. Customers sign in and see the call-outs we've done for them. `data/jobs.json` holds every job; `data/customers.json` holds customer contact details; each job's invoice is a file in `invoices/`.

Rules for every endpoint:

- A request needs a signed-in session; otherwise it gets 401.
- Customers only ever see their own jobs and invoices. Anything belonging to someone else is answered with 404, exactly as if it didn't exist.
- Lists are paginated 10 to a page, and pages are numbered from 1.

`src/api.mjs` routes requests to the handlers. `npm test` runs the handler tests.
