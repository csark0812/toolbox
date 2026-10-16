# Roster

Staff directory API. Every request carries the caller's id in the `x-user-id` header, and what they may do comes from their role.

Permissions are cached per user so a busy page does not hit the database on every request. The cache entry is dropped whenever that user's role changes, so the new role applies to their next request.

`npm run demo` replays a short session against the API. `npm test` runs the tests.
