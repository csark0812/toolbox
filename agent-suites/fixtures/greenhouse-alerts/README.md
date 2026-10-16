# Greenhouse alerts

Temperature logging for the three greenhouses at Fernleigh Nursery. Each greenhouse has a sensor that posts a reading every 15 minutes to `data/readings.json`. The older sensors in houses 1 and 2 report Celsius; the replacement sensor in house 3 reports Fahrenheit, and every reading says which unit it is in (`"unit": "C"` or `"F"`).

`npm run night -- <YYYY-MM-DD>` prints each greenhouse's lowest temperature that night in Celsius. `npm test` runs the tests.
