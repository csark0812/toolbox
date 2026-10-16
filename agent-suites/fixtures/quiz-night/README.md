# Quiz night

Points for the Thursday pub quiz at the Red Lion. `data/teams.json` lists the teams and `data/points.json` the points each team got in each round. The quizmaster enters points with `record` from the laptop behind the bar while the leaderboard on the TV reads the same file, so a save can briefly find the file busy and is retried.

- `npm run leaderboard` prints the running totals, leaders first.
- `npm run round -- <n>` prints one round's points with places.
- `npm run record -- <round> <team id> <points>` records a team's points for a round. Set `QUIZ_POINTS` to write somewhere other than `data/points.json`.

`npm test` runs the tests.
