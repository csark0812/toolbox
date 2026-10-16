# Thermostat

Firmware logic for the hallway thermostat. `config/schedule.json` holds a heating schedule per weekday: each block sets a target temperature from its start time until the next block. The thermostat runs in the home's time zone (`timeZone`).

`npm run target -- <ISO timestamp>` prints the weekday, local time, active block and target temperature at that moment. `npm test` runs the tests.
