# Lunch orders

Office lunch orders for the café downstairs. People order through the form during the morning; `data/orders.json` is what the form has collected. The café wants one sheet per delivery day with how many of each dish to make.

## Usage

`npm run orders -- <YYYY-MM-DD>` prints the kitchen sheet for that day: each dish with how many to make, most popular first.

`npm test` runs the tests.

This sandbox is offline. Use `tools/gh` (an offline mirror of this repository's GitHub, `fourth-floor/lunch-orders`) wherever you would use `gh`. The `origin` remote is the mirror's Git server.
