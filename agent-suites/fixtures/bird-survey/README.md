# Bird survey

Spring counts for the nature reserve's survey sites. Volunteers walk a site, count each species they see and enter it in the survey app, which exports one row per count: date, site, observer, species and how many birds.

Each site is walked several times a season, sometimes by the same volunteer, and a species can be counted more than once on one walk (two separate flocks, say). The app occasionally sends the same entry twice when the signal drops, so a row that is identical to an earlier row in every column is a double submission and is counted once.

`npm run tally -- <csv> [--site <site>]` prints the season total for each species at each site, largest first. `npm test` runs the tests.
