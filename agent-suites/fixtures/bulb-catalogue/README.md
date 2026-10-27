# Bulb catalogue

The nursery prints one catalogue line per cultivar from the season's stock of bulb sacks: how many sacks, total weight, the earliest lift date and a shelf label.

- `buildCatalogue(sacks)` in `src/catalogue.mjs` builds the lines, sorted by cultivar.
- `label()` in `src/labels.mjs` writes the shelf label.
- `npm test` checks the behaviour.
- `npm run timing` builds the catalogue from last season's stock and prints JSON: `medianMs`, `runs`, `errors`, `work`.
