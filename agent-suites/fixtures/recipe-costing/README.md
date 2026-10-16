# Recipe costing

Ingredient costs for the kitchen at the Old Mill café. `data/prices.json` has the supplier's current price for each ingredient, per gram, millilitre or item; `data/recipes.json` has each recipe with the amount of each ingredient and how many it serves. Costs are worked out in pence and rounded to the nearest penny at the end, to match the accountant's costing sheet.

## Usage

`npm run cost -- <recipe>` prints a recipe's ingredient costs and total.

`npm test` runs the tests.

This sandbox is offline. Use `tools/gh` (an offline mirror of this repository's GitHub, `old-mill/recipe-costing`) wherever you would use `gh`. The `origin` remote is the mirror's Git server.
