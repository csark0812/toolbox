# Air quality

Readings from the PM2.5 sensors around the house, one file per room in `data/` (`time,pm25`, every ten minutes, times in UTC).

- `npm run aqi -- <room> [--at <ISO time>]` prints the room's current air quality index for the dashboard.
- `npm run report -- <room> <YYYY-MM-DD>` prints the day's average for the weekly email.

`npm test` runs the tests.
