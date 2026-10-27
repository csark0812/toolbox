# Dance school

Termly invoicing for the Linden Street School of Dance. The office runs `npm run invoices -- <term>` at the start of each term to bill every family for the classes their children take. `data/classes.json`, `data/pupils.json` and `data/invoices.json` hold the school's records; amounts are whole pence and dates are `YYYY-MM-DD`.

How the school bills:

- One invoice per family per term, listing each class a child in the family takes. Children in the same family share a `familyId`; surnames are not a guide, since plenty of our families have more than one.
- The family's most expensive class is full price. Every further class anyone in the family takes is 10% off, with the discounted price rounded down to whole pence.
- An invoice is due 14 days before the term starts.
- An invoice still unpaid 14 days after it was due has a £5 late fee added, once.
- A paid invoice is never changed or removed: the payment (`paidOn`, `paidPence`) lives on the invoice and is the school's only record of it.

`npm test` runs the billing tests.
