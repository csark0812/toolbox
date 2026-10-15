# Weekly digest

Every Monday the digest job picks the users who are due a digest (opted in, nothing sent for 7 days) and schedules each send for 08:00 in the user's time zone (UTC when none is set).

`npm run digest` prints the plan for `data/users.json` as of `data/now.txt`. `npm test` runs the tests.

New accounts come from `src/signup.mjs` (the signup flow shipped on 2026-09-21). Older accounts were imported from the previous system.
