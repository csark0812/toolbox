# Loyalty cards

Points for the coffee shop's loyalty card. Customers earn a point per 10p spent and redeem points for drinks. Per our terms, points expire 12 months after they are earned.

`data/customers.json` holds each card's earn and redeem events. `npm run balance -- <card> [--on YYYY-MM-DD]` prints the card's history and balance on that day (today by default). `npm test` runs the tests.
