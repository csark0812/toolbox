# Lifeboat donations

Donations to Porthkennack Lifeboat Station and the monthly Gift Aid claim. `data/donations.json` has every donation (card reader, cash collections and bank transfers) with the donor's name and postcode. `data/declarations.json` has the Gift Aid declarations donors have signed, on paper or through the online form, with the date each was signed and, if the donor later withdrew it, the date it was cancelled.

Gift Aid rules, from HMRC's guidance:

- We claim 25p for every £1 donated by someone with a Gift Aid declaration. A donation is matched to a declaration by the donor's surname and postcode.
- A declaration covers donations made on or after the day it was signed, and also donations made in the four years before that: from the same date four years earlier.
- A cancelled declaration covers nothing given on or after the day it was cancelled.

```
npm run claim -- 2026-10   # every donation in October and the Gift Aid on it, then the claim total
npm test
```
