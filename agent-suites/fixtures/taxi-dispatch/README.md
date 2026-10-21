# Brookside Taxis

Bookings and fares for Brookside Taxis. `data/jobs.json` holds every job: when and where we picked up, where we dropped off, the miles on the meter, any minutes spent waiting, the driver, and whether the customer paid cash or is on account.

## Fares

- £3.00 when the meter starts, then £2.00 a mile.
- Night rate, from 10pm until 6am, is time and a half on the meter.
- Waiting time is 25p a minute at any hour and is not part of the night rate.

Account customers are invoiced at the end of the month. Bookings: 01632 960400 or bookings@brooksidetaxis.co.uk.

## Usage

```
npm run sheet -- 2026-11-07   # the day sheet for the drivers
npm run fares                 # every job's fare, with totals for each driver
npm test
```

New drivers should read `docs/drivers.md`.
