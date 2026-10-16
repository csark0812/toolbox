# Pager escalation

On-call paging for the platform team. `src/incidents.mjs` opens and acknowledges incidents; `src/pager.mjs` sends pages (here it records them, the real transport is an SMS gateway). The on-call tiers are in `data/rota.json`: primary, secondary, then the engineering manager.

Severities are `critical`, `high`, `low`. `npm test` runs the tests.
