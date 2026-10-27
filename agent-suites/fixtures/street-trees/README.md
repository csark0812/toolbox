# Street trees

Safety surveys of the town council's street trees. Each tree is surveyed at least twice a year and rated `SOUND`, `WATCH` (look again sooner) or `DANGER` (risk of falling limbs).

`data/trees.csv` lists the trees. `data/surveys.csv` has one row per survey: the tree, the date, the rating, and whether it was keyed in at the office from the paper sheet or entered on the surveyor's tablet out in the street.

A tree's rating is the rating from its most recent survey. A tree rated `DANGER` must have barriers round it until a later survey rates it `SOUND` or `WATCH`; the highways team puts the barriers up and takes them down from the fencing list.

`npm run fencing` lists every tree with its most recent survey and marks the ones that need barriers with `FENCE`.

## Usage

```
npm run fencing   # every tree's current rating, and the trees to fence
npm test
```
