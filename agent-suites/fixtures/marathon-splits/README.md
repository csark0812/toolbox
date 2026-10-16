# Marathon splits

Results for the Riverside Marathon. Timing mats at the start line, 10 km, halfway, 30 km and the finish record when each runner's chip crosses them (`data/mats.csv`, time of day). The gun goes at 09:00:00, but runners further back take a few seconds to reach the start line.

Chip time runs from when a runner crosses the start mat to when they cross the finish mat. Splits are the times between mats, starting from the runner's own start mat crossing, so they add up to the chip time. Pace is shown per kilometre, rounded up to the next second.

## Usage

```
npm run splits -- 214   # one runner's splits, pace and chip time
npm run results         # everyone by chip time
npm test
```
