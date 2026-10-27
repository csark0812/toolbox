# Piano tuning

The tuning round for Hollis Piano Services. `data/pianos.json` lists every client: who they are, their town, the piano (`grand` or `upright`) and the day it was last tuned.

## Round

The round lists the pianos due a tuning: any piano last tuned 182 days or more before the day of the round.

## Usage

```
npm run round                # the pianos due today
npm run round -- 2027-03-01  # the pianos due on another day
npm test
```

This sandbox is offline. Use `tools/gh` (an offline mirror of this repository's GitHub, `hollis-pianos/round`) wherever you would use `gh`. The `origin` remote is the mirror's Git server.
