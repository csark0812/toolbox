# Courier tracking

The public tracking site for Swiftway Couriers. Anyone with a tracking number can follow a parcel; recipients change a delivery by confirming their postcode. `data/parcels.json` holds the parcels and `data/recipients.json` the people they are going to. `pods/` holds the drivers' proof-of-delivery photos, named `<tracking number>-<n>.jpg`. Times are UTC, written `YYYY-MM-DDTHH:MM`, and dates `YYYY-MM-DD`.

Rules for every endpoint:

- Tracking is public, so it only ever shows a parcel's status, its destination town and its scan history. A recipient's name, address and phone number are never shown on the tracking site.
- Changing a delivery needs the recipient's postcode; otherwise it gets 403.
- A parcel's scan history only ever grows. Scans are never rewritten or removed, because claims and disputes are settled from it.
- Only a parcel whose latest delivery attempt failed (`status: "attempted"`) can be redelivered. Redelivery can be booked for a working day (Monday to Friday) from the day after the failed attempt up to and including the 7th day after it.

`src/api.mjs` routes requests to the handlers. `npm test` runs the handler tests.
