# Sales export

Writes the nightly sales CSV that finance imports. `exportCsv(sales, sink)` takes any iterable of sale records and calls `sink.write(text)` with the CSV text, header first, one line per sale, each line ending in `\n`. Fields that contain a comma, a quote or a newline are quoted, with quotes doubled. Amounts are written in dollars with two decimals; refunds are negative.

The nightly job runs on a small container, and the export has started getting killed for using too much memory.

`npm run export -- <count>` writes a synthetic export to stdout. `npm run perf` runs a full-size export in fresh processes and prints JSON with the median peak memory. `npm test` runs the tests.
