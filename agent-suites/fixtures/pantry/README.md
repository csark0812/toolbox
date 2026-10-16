# Pantry

What's in our kitchen cupboards and when it goes off. `data/pantry.json` has every item with its quantity (`1.5 kg`, `400 g`, `6 eggs`) and best-before date.

- `npm run pantry -- list [--today YYYY-MM-DD]` shows each item with its state: expired, expires today, soon (within three days) or fine.
- `npm run pantry -- totals` adds up the quantities per unit, for the shopping list.

`npm test` runs the tests.
