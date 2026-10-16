# Library loans

Loans for a neighbourhood lending library. A loan is `out` until it comes back (`returned`); an `out` loan past its due date becomes `overdue`, and one missing for 60 days past due is `lost`. Older exports wrote `late` for overdue loans; those are read as `overdue`.

`npm run loans -- report|overdue|list [--status <status>] [--today YYYY-MM-DD]` reads `data/loans.json`. `npm test` runs the tests.
