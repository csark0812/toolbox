# Rain gauge

The Hollins Lane allotment society's tipping-bucket rain gauge. The logger writes one line to `data/tips.csv` every time the bucket tips, with the time in UTC; each tip is 0.2 mm of rain.

Days are UK days, midnight to midnight local time: GMT in winter and BST (UTC+1) in summer. BST runs from 01:00 UTC on the last Sunday of March to 01:00 UTC on the last Sunday of October.

`npm run daily` lists the rainfall for each day of a month and the month's total, and marks a day `HEAVY` when 25 mm or more fell. The society sends its heavy days to the parish drainage board, which uses them to decide which ditches to clear before winter.

## Usage

```
npm run daily -- 2026-10   # rainfall each day of a month
npm test
```
