# Quiz league

The season table for the Vale pub quiz league. `data/teams.json` lists the registered teams, some with the aliases they tend to write on their answer sheets, and `data/nights.json` has every quiz night with each team's round scores as the quizmaster entered them.

Rules for the table:

- Team names on the sheets are matched to the registered teams ignoring case and extra spaces, by name or by alias. A team that is not registered does not take a place on the night.
- If a team hands in a second sheet on the same night, the second one replaces the first.
- Each team plays one joker per night, naming the round (counting from 1) whose score is doubled. A joker naming a round that wasn't played does nothing.
- On each night, teams are placed by score; teams on the same score share the place and the next place is skipped. Places earn 10, 8, 6, 5, 4, 3, 2 and 1 league points, and every team placed eighth or lower gets 1.
- Only a team's best ten nights count towards its league points and its quiz points; when nights are worth the same league points, the earlier ones count.
- The table is ordered by league points, then quiz points, then nights won (all nights, counted or not), then by team name in the usual alphabetical order. Every registered team is listed, even one that hasn't played yet.

## Usage

```
npm run table   # the league table
npm run perf    # times the table on a full season
npm test
```
