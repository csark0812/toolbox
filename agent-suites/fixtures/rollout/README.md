# Rollout

Feature flags for the shop. Each flag in `config/flags.json` has a rollout percentage and optional targeting rules. `isEnabled(flag, user)` decides whether a user sees a feature, and the decision is sticky per user.

`npm run exposure -- <flag>` reports how many of the users in `data/users.json` (yesterday's active users) get a flag. `npm test` runs the tests.
