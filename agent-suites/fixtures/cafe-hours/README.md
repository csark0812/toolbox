# Café hours

Opening hours for the Driftwood Café, as shown on the website and the sign by the door. `data/hours.json` has one entry per weekday: `closed`, or one or more `HH:MM-HH:MM` ranges separated by commas. A range that ends before its start runs past midnight into the next day (the late bar on Friday and Saturday), and `24:00` means midnight at the end of the day. Times are the café's local wall-clock time.

`npm run hours` prints the week. `npm test` runs the tests.
