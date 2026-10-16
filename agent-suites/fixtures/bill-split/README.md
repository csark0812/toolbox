# Bill split

Splits a shared bill between friends. Each item is shared evenly by the people listed on it, and the tip is shared in proportion to what each person ordered.

All money is handled in whole cents. When an amount does not divide evenly, `allocate()` gives each person the rounded-down share of their exact amount and hands the leftover cents, one at a time, to the largest fractional parts (earliest person first on a tie). The shares always add up to the amount being split.

`npm run split -- data/dinner.json` prints each person's share. `npm test` runs the tests.
