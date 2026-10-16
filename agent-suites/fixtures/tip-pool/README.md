# Tip pool

Splits the card tips at the Harbour Kitchen restaurant among the staff on shift each day. `data/shifts.json` has everyone's clock-in and clock-out times and `data/tips.json` the card tips taken each day, in pence.

`npm run split -- <YYYY-MM-DD>` prints each person's share for the day. Shares are rounded down to the penny; any pennies left over go to the staff social fund. `npm test` runs the tests.
