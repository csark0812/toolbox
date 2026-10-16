# Route table

The request router in front of our shop API. `createRouter(routes)` takes `{ method, path, name }` entries and returns `match(method, url)`, which gives `{ name, params }` for the route that handles a request, or `null`.

Matching rules:

- The query string and fragment are ignored, and so is one trailing slash (except on `/`).
- A pattern segment is literal text (case-sensitive), a `:param` that matches one non-empty segment, or a final `*` that matches one or more remaining segments (its value is `params['*']`).
- Param values are percent-decoded. A value that cannot be decoded does not match that route.
- `HEAD` requests are served by `GET` routes, and a route with method `*` takes any method.
- When several routes match, the most specific wins, segment by segment from the left: literal beats `:param`, which beats `*`. Routes of the same shape keep the order they were registered in.

`npm run match -- <METHOD> <url>` matches one request against `routes.json`. `npm run perf` times a burst of requests against a large route table and prints one JSON line. `npm test` runs the tests.
