# Kiln firing

Firing schedules for the Clayworks studio kiln. `data/programs.json` holds each program as a list of segments: a ramp to a temperature at a rate in °C per hour, or a hold for some minutes. `data/firings.json` is the kiln log.

## Usage

```
npm run kiln -- plan bisque      # each segment with its duration and the clock time it ends, starting 18:00
npm run kiln -- plan glaze 07:30 # starting at another time
npm run kiln -- log              # the firing log with each firing's length
npm run kiln -- total glaze      # total program length
npm test
```
