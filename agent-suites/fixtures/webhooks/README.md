# Webhooks

Delivers order events to partner endpoints and retries failed deliveries.

Settings live in `config/webhooks.json`. `data/deliveries.log` is yesterday's delivery log from production. `npm run replay` re-runs the deliveries recorded in `data/responses.json` against a simulated clock and prints a log in the same format. `npm test` runs the tests.
