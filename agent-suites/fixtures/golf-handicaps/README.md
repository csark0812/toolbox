# Golf handicaps

Handicap records for Westcombe Golf Club. `data/rounds.json` holds every qualifying round: who played, the date, the course and the gross score. `data/courses.json` gives each course's rating (in tenths of a stroke, so `712` is 71.2) and slope. Names are typed by whoever is in the pro shop, so `Ann Kerr`, `ANN KERR` and ` ann kerr` are one player.

Each round's score differential, in tenths, is `round((gross × 10 − rating) × 113 ÷ slope)`. A player's index after a round uses their 20 most recent rounds up to and including that one (by date, then by round id for rounds on the same day): with fewer than 3 there is no index yet; otherwise the best 40% of them (rounded down, at least one) are averaged and rounded to the nearest tenth. A round on an unknown course is an error.

## Usage

```
npm run history -- "Ann Kerr"   # a player's index after each round
npm run perf                    # times the whole club's history
npm test
```
