# Job board

Search for the regional creative-industries job board. `data/jobs.json` holds the current listings; `config.json` has the cities we know and the default home city.

`npm run search -- <words> [--near <city>]` lists matching jobs. Results are listed nearest first, so people see jobs they can get to; `--near` sets where the searcher lives (the home city in `config.json` otherwise). `npm test` runs the tests.
