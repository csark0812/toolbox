# Contacts import

Imports contacts exported from the old CRM as CSV. Column headers are normalized (lowercase, runs of other characters become `_`), and values that look like numbers are stored as numbers so the reporting tools can sum and sort them. Identifier-like columns are kept as text.

`npm run import -- data/crm-export.csv` prints the imported records as JSON. `npm test` runs the tests.
