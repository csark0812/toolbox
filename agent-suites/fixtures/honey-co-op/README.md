# Honey co-op

Moorside Beekeepers' honey co-op buys members' honey in bulk and sells it on under the co-op label. Every time a member brings honey in, it is weighed and logged in `data/deliveries.json` (member, date, weight in kilograms, and which scale weighed it).

There are two scales:

- the hanging scale in the store, where Pat reads the weight off and types it into the office PC;
- the bench scale in the extraction room, bought in August 2026. Its readings are copied straight from the scale's own export, and it will carry on being used for every delivery from now on.

## Price

The committee set the price per kilogram:

- £7.50 per kg for honey delivered up to and including 31 August 2026;
- £8.20 per kg for honey delivered on or after 1 September 2026.

Each delivery is paid at the price for its delivery date, rounded to the nearest penny. A member's monthly statement is the sum of their deliveries that month.

```
npm run statement -- 2026-09   # each member's honey and pay for September, and the total
npm test
```
