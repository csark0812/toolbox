# Timesheets

Weekly hours report for the studio's contractors. Each entry in a timesheet export is one shift: who, which project, the date, and start and end times (`HH:MM`, a shift that ends before it starts runs past midnight). The report groups shifts by person and ISO week (`2026-W38`, weeks start on Monday) and shows total hours, overtime above 40 hours, and the projects worked on in alphabetical order. Rows are ordered by the person's name, then by week. Entries for unknown people are skipped and counted.

`npm run report -- data/sample.json` prints the report. `npm run perf` builds the report for a synthetic quarter of shifts and prints JSON timings. `npm test` runs the tests.
