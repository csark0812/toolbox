# Parking permits

Residents' parking permits for the Old Town zone. `data/permits.json` holds each permit: the holder, the street, the vehicle and the last day it is valid.

A permit lasts a full year. A renewal starts the day after the old permit ends and is valid up to and including the day before the same date the following year, so a permit starting 1 May runs to 30 April.

## Usage

```
npm run renew -- P-2207      # dates for a permit's renewal
npm run expiring -- 2027-04  # permits ending that month, for the reminder letters
npm test
```
