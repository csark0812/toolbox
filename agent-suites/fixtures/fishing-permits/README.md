# Fishing permits

Day and season permits for the Wessex Angling Association's waters. Prices are in pence and depend on the water, how many days, the angler type (adult, senior or junior), how many rods and whether a concession applies. Juniors get the concession unless told otherwise. A water's minimum days are billed even if fewer are asked for, and seven days or more is billed at the week rate.

The club website's booking page uses this package's public entry, `src/index.mjs`. It lives in the website's own repository, which this project doesn't control.

## Usage

```
npm run quote -- kennet 3 senior 2   # water, days, angler, rods, concession (yes/no); all but the water optional
npm run quote                        # today's club lake day ticket
npm run bulk                         # quotes for the postal requests in data/requests.csv
npm run renewals                     # renewal reminders, repeating each member's last quote
npm run cheapest -- 3 junior         # the cheapest water for a stay
npm test
```
