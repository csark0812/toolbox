# River gauges

Flood alerts for the Wyvern catchment's volunteer flood wardens. Each gauge reports the river level in metres every 15 minutes; `data/readings.json` has the readings (UTC times, to the minute) and `data/thresholds.json` the alert level for each gauge. A gauge whose sensor fails reports `null`.

A gauge is on alert at a reading when the mean of its last four readings (the hour up to and including it) is above its threshold. The four readings must be 15 minutes apart with none missing: after a gap or a failed reading the gauge needs four fresh readings before it can alert again. Consecutive alert readings form one alert period, reported with its first and last reading, the highest level reached during the period and how many readings it covered. Periods are listed by start time, then by gauge.

## Usage

```
npm run alerts   # the alert periods for the readings
npm run perf     # times the alerts on a month of the whole catchment
npm test
```
