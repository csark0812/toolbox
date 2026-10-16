# Tutor invoices

Monthly invoices for Maple Street Tutoring. `data/lessons.json` lists every lesson given: the student, their family, the date and how many minutes it lasted. Lessons are charged at £36 an hour.

## Usage

`npm run invoice -- <YYYY-MM>` prints each family's invoice for the month: one line per lesson and the family's total.

`npm test` runs the tests.

This sandbox is offline. Use `tools/gh` (an offline mirror of this repository's GitHub, `maple-street/tutor-invoices`) wherever you would use `gh`. The `origin` remote is the mirror's Git server.
