# Meter readings

Monthly summaries of half-hourly smart meter readings for the housing co-op. The network operator sends a CSV export (`meter,timestamp,kwh`, timestamps in UTC, rows in time order). A reading with an empty `kwh` is a gap: the meter did not report.

`monthlySummary(file)` returns one row per meter and month, sorted by meter then month: total kWh (rounded to 3 decimals), the peak half-hour and when it was (the first one if several tie), the number of readings and the number of gaps. A row with the wrong number of fields is an error that names its line number.

`npm run summary -- <file.csv>` prints the summary as a table. `npm run perf` summarises a quarter of readings for the whole estate in fresh processes and prints one JSON line with the median peak memory. `npm test` runs the tests.
