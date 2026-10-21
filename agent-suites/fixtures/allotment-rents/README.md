# Allotment rents

Rent accounts for the Brook Street allotment society. `data/rents.json` has who has held each plot and when (`to` is `null` for a current tenancy), the rent invoices raised for each plot (amounts in pence), and the payments from the society's bank feed (amounts in pounds, as the bank sends them, with whatever reference the tenant typed).

Rules for the accounts:

- An invoice is billed to whoever held the plot on the day it was issued, and a payment is credited to whoever held the plot its reference names on the day it arrived. A tenancy covers its first and last days; on a handover day the incoming tenant holds the plot.
- The plot in a reference is its first number, with the letter straight after it if there is one, so `Plot 12a rent`, `PLT-12A` and `12A` are all plot 12A and `plot 007` is plot 7. A payment with no number in its reference, or for a plot nobody held that day, is listed as unmatched for the treasurer.
- Each payment is rounded to the nearest penny. It pays off the tenant's oldest unpaid invoice first (by issue date, then invoice number as the treasurer files them, so `INV-2025-11` comes before `INV-2025-9`), then the next, across all the tenant's plots. Anything left over is held as credit and pays the tenant's next invoice when it is issued. Invoices are raised before payments are banked on the same day.
- Accounts are listed by the amount owed, largest first, then by tenant name in the usual alphabetical order. Every tenant who has held a plot is listed.

## Usage

```
npm run accounts   # every tenant's account and the unmatched payments
npm run perf       # times the accounts on the society's full history
npm test
```
