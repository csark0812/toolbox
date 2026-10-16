# Brew log

Tracks our homebrew batches while they ferment: the latest temperature and gravity readings, the estimated alcohol so far, and alerts when a fermenter is too warm, too cold or has been going too long.

`npm run brew -- status` prints every batch; `npm run brew -- alerts` prints only the problems and exits with 1 when there are any.

Settings come from the environment:

| Variable              | Meaning                                         | Default   |
| --------------------- | ----------------------------------------------- | --------- |
| `BREW_UNITS`          | `metric` (°C) or `imperial` (°F)                | `metric`  |
| `BREW_DATA_DIR`       | folder holding `batches.json`                   | `data/`   |
| `BREW_ALERT_TEMP_MAX` | warmest acceptable temperature, °C              | `22`      |
| `BREW_ALERT_TEMP_MIN` | coolest acceptable temperature, °C              | `16`      |
| `BREW_ALERT_DAYS_MAX` | days in the fermenter before it needs attention | `21`      |
| `BREW_NOW`            | the current time, for demos and tests           | the clock |
| `NO_COLOR`            | any value turns off coloured alerts             | unset     |

`npm test` runs the tests.
