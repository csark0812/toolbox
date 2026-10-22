# Hill race

Results for the Cefn Ridge hill race. Everyone starts together; `data/runners.json` holds each runner's finish time, age on race day and any checkpoints the marshals recorded them as missing.

How a runner's adjusted time is worked out:

- **Time** is finish minus start.
- **Penalty:** 10 minutes for each missed checkpoint.
- **Age allowance:** runners aged 50 and over have 3 minutes taken off; runners aged 60 and over have 6 minutes taken off instead.
- **Adjusted time** is time plus penalty minus allowance. Places go by adjusted time, fastest first.

## Usage

```
npm run results   # place, runner, time, penalty, allowance and adjusted time
npm test
```
