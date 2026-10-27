# Roof appeal

Donations to the St Michael's Church roof appeal, and the quarterly Gift Aid claim the treasurer sends to HMRC.

`data/donations.csv` has one row per gift (date, donor, amount, source): collection-plate envelopes, online gifts, standing orders, and raffle tickets sold at events. Envelopes with no donor number are anonymous. `data/donors.csv` holds each donor's Gift Aid declaration date and, if they have told us they no longer pay enough tax, the date they cancelled it.

## Gift Aid rules

- We claim 25p for every £1 donated by a donor with a Gift Aid declaration.
- A declaration covers every gift made on or after the date it was signed, and every gift made in the four years before it.
- When a donor cancels, gifts made on or after the cancellation date are no longer covered. Earlier gifts still are.
- Raffle tickets are purchases, not gifts, and never qualify. Anonymous gifts never qualify.
- Each claim covers the gifts made in one calendar quarter (Q3 is July to September), whenever the declaration arrived.

`npm run claim` lists the gifts in a quarter that Gift Aid is claimed on, the total of those gifts, and the Gift Aid to claim.

## Usage

```
npm run claim -- 2026-Q3   # the Gift Aid claim for a quarter
npm test
```
