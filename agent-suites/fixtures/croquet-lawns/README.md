# Croquet lawns

Lawn bookings for Elm Row Croquet Club. `config/club.json` holds the club settings and is also read by the club's booking website. `data/bookings.csv` is exported each week from the membership spreadsheet.

## Usage

```
npm run day -- 2026-06-06              # who is on each lawn that day
npm run day -- 2026-06-06 --lawn B     # one lawn only
npm run export                         # every booking as CSV for the secretary
npm test
```
