# Coach outings

Bookings for the Halden Village Society's coach outings. Pat Greaves runs them; Brimble's Coaches supply the coach and driver.

- `data/trips.json` is this season's trips: code, destination, date, departure time, seats on the coach and the fare in pence.
- `data/bookings.json` is who is going: booking ref, trip, name, seats, the date they booked (`bookedOn`) and whether they've paid.
- `data/archive/<year>.json` holds past seasons, trips and bookings together, for the year report.

Dates in the files are day first, the way the office types them (`07/11/2026`; older entries also have `7/11/2026`, `07.11.2026` or `7-11-2026`).

Anyone booked less than a week before a trip is flagged LATE on the manifest, because Brimble's need final numbers a week ahead.

## Usage

```
npm run manifest -- 2026-11          # trips that month, with who's on them
npm run year -- 2025                 # trips, passengers and fares by month
npm run export                       # the CSV for Brimble's booking system
npm run book -- T-261128 "Ann Lee" 2 # add a booking, dated today
npm test
```

The export is imported by Brimble's as it is: `trip_ref,travel_date,depart_time,destination,passengers`, with the date as DD/MM/YYYY.
