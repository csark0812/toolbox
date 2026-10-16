# Boiler service

Annual gas boiler services for Hearth & Flue Heating. `data/customers.json` has each customer's boiler and the date of its last service; a service is due a year later.

- `npm run letters -- <YYYY-MM>` prints the reminder letters for services due that month, from the templates in `templates/`.
- `npm run runsheet -- <YYYY-MM-DD>` prints the engineer's visits booked for a day.
- `npm run report -- <YYYY-MM>` prints the office's monthly table of services due.

Dates are calendar dates (`YYYY-MM-DD`) with no time zone. `npm test` runs the tests.
