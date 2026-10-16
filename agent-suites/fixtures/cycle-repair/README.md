# Cycle repair

Job tickets for Spoke & Chain, a two-mechanic bike repair shop. `data/jobs.json` holds each job: the customer, the bike, its status (`open`, `waiting-parts` or `done`), when it should be ready, the labour in hours and the parts used. `data/customers.json` has the customers' phone numbers for the "ready to collect" texts.

Labour is charged at £40 an hour. Parts are charged at their price for each one fitted.

## Usage

```
npm run jobs             # every job with its status and when it should be ready
npm run ticket -- J-118  # the itemised ticket for one job
npm test
```
