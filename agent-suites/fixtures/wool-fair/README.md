# Wool fair

Fleece weigh-in totals for the Fellside Wool Fair. `data/fleeces.csv` has one row per fleece entered: the fair day, the breed, the exhibitor and the weight in kilograms. A weight of 0 means the fleece was entered but withdrawn before judging; a blank weight means it has not been weighed yet.

## Usage

```
npm run day -- 1     # breed totals for day 1
npm run day -- 2     # breed totals for day 2
npm run fair         # breed totals for the whole fair
npm test
```
