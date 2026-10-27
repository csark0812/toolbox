# Gliding club

Task results for Kestrel Edge Gliding Club's summer ladder. `data/handicaps.json` has the club handicap index for each glider type we fly (higher means a faster glider), and `data/tasks.json` has every task day: the date, the task, and each pilot's competition number, glider type and elapsed time as the launch point wrote it on the sheet (`47:12`, `2:30:25`, or `DNF`, `DNS`, `DSQ` for pilots who landed out, didn't launch or were disqualified).

## Usage

```
npm run tasks   # every task day and its pilots
npm test
```
