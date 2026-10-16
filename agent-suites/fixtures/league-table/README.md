# League table

Standings for the Sunday five-a-side league, and the week-by-week position chart on the league's website.

A season file lists the teams and the fixtures. Each fixture has a round number; a fixture whose goals are `null` has not been played (postponed matches are played later with their original round number). A win is worth 3 points and a draw 1. Teams are ranked by points, then goal difference, then goals for, then name.

`standingsAfter(season, round)` is the table counting every played fixture up to and including that round. `progression(season)` is the table after each round from 1 to the last, which the website turns into the position chart.

`npm run table -- <season.json> [--round <n>]` prints a table. `npm run perf` times the position chart for a batch of full-size seasons. `npm test` runs the tests.
