# Access logs

Summarizes HTTP access logs per route for the on-call dashboard.

Each line looks like `2026-10-01T12:00:00.123Z GET /users/123?tab=posts 200 34ms`. Paths are matched against the route table in `src/routes.mjs` (first match wins, query strings ignored); anything unmatched is `other`. For every `METHOD route` the summary reports the request count, the number of 5xx responses, and p50 and p95 latency (nearest-rank percentiles). Routes are listed busiest first, then by name. Lines that do not parse are counted as `malformed`.

`npm run summary -- <file>` prints a table. `npm run perf` summarizes a day's worth of synthetic traffic and prints JSON timings. `npm test` runs the tests.
