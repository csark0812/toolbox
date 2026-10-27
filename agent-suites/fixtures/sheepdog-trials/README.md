# Sheepdog trials

Results for the Fellside sheepdog trials. The judges' tablets append each finished run to `data/runs.jsonl`, one JSON object per line: handler, dog, class (novice, open) and points out of 100. A run that was retired or disqualified has a word instead of a number in `points`; those lines are skipped with a warning. If the tablet loses signal mid-write the file can end up with a broken line, and everything after it can't be trusted.

Every command takes the runs file as an optional first argument (default `data/runs.jsonl`).

## Usage

```
npm run scores                       # every run as it was scored, then the total
npm run leaderboard -- open          # top three in a class
npm run leaderboard -- --strict      # exit 2 if any line was skipped
npm run count                        # how many runs are in
npm test
```
