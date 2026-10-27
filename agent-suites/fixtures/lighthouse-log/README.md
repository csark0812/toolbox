# Lighthouse log

The fog signal log for Start Rock lighthouse, now run by the heritage trust. Each keeper on watch logs when they started and stopped the fog signal; `data/fog.csv` is the month's log (date, start, end, keeper). A period that runs past midnight is logged on the day it started.

`npm run fog` reports how long the signal sounded. The trust uses that figure for the signal's maintenance hours, so it should be the time the signal was actually sounding: when two keepers' periods overlap at a handover the signal only sounded once.

## Usage

```
npm run fog -- 2026-10   # hours the signal sounded in a month, by day
npm test
```
