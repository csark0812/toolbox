# Leaderboard service

`summarize(records)` returns one entry per player id, highest score first. It powers the leaderboard page.

- `npm test` checks the behavior.
- `npm run bench` times `summarize` on the production-sized sample and prints JSON: `medianMs`, `runs`, `errors`, `work`.
