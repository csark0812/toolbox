# Bell ringers

The Severn Vale district's tower list for bell ringers. `data/towers.json` has each tower: its `name`, `bells` (how many bells hang there), the `tenor` weight (hundredweight-quarters-pounds) and the practice night. A tower that hasn't been surveyed yet has no `bells` and is taken to have a ring of 6.

## Usage

```
npm run towers -- --sort bells   # every tower, sorted by bells, name or tenor
npm run export                   # CSV for the district's other tools
npm run outing -- 7              # towers a band of this many ringers can ring
npm test
```
