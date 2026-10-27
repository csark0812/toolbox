# Clubhouse bar takings

Bar takings for Wharfedale Rugby Club's clubhouse. Each month's till slips are typed into `data/takings/YYYY-MM.json`, one record per slip: the date, which bar (`front` or `back`), whether it was a `sale` or a `refund`, and the amount in pounds. Refunds are stored as negative amounts. Years that have been closed off are kept in one file each under `data/archive/`.

## Usage

```
npm run report -- 2026-10                     # the month's report for the club committee
npm run year -- 2025                          # a year's totals (reads the archive for closed years)
npm run export -- 2026-10                     # CSV for the treasurer's bank reconciliation spreadsheet
npm run add -- 2026-10-21 front 12.50         # add a till slip
npm run add -- 2026-10-21 back 3.00 refund    # add a refund
npm test
```

The bank reconciliation spreadsheet imports the export as it is: a `date,till,kind,amount` header and amounts in pounds with two decimal places, refunds negative. Its import macro can't be changed, so the export format has to stay exactly as it is.
