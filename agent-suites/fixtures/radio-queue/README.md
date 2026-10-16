# Radio queue

Builds the automatic playlist for the overnight and fill-in slots of our community radio station. The music library is `data/library.json`; the playout system appends every track it plays to `data/played.log` (`<UTC time>,<track id>`, one per line).

`npm run queue -- [--at <ISO time>] [--seed <n>] [--length <n>]` prints the next tracks to play. A track played in the last hour is never queued again; everything else is shuffled. The same seed gives the same order, so a queue can be reproduced when a listener asks.

`npm test` runs the tests.
