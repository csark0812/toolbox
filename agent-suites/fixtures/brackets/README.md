# Brackets

Draws the first round of single-elimination brackets for the club's table tennis ladder. Players in `data/*.json` are listed by seed (best first). The bracket is padded to the next power of two; the missing slots are byes, and the top seeds get them. Seed 1 and seed 2 can only meet in the final.

`npm run draw -- data/autumn.json` prints round one. `npm test` runs the tests.
