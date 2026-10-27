# Lettings

The deposits API for Harbour Lettings. Landlords sign in to manage their tenancies; tenants sign in to the tenant portal to see theirs. `data/landlords.json`, `data/tenancies.json` and `data/deductions.json` hold the records. Money is held in pence.

Rules for every endpoint:

- A request needs a signed-in session (`landlordId` or `tenancyId`); otherwise it gets 401.
- A landlord only ever sees or changes their own tenancies. Anyone else's tenancy is answered with 404, exactly as if it didn't exist.
- A landlord can claim deductions from a deposit up to and including the 10th day after the tenancy's end date. After that the claim window is closed and the rest of the deposit goes back to the tenant.
- The deductions on a tenancy can never add up to more than its deposit.
- Pages in the tenant portal are HTML, and anything a landlord typed is shown as text.

`src/api.mjs` routes requests to the handlers. `npm test` runs the handler tests.
