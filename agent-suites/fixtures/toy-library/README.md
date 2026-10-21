# Toy library

Loans and late fines for the Elmfield toy library. `data/loans.json` lists each loan: the family, the toy, the date it was due back and the date it came back (or `null` if it's still out).

A toy is late from the day after it is due. Late toys are fined 20p for each day late; toys still out are fined up to the day the list is run.

## Usage

```
npm run fines -- --today 2026-11-02   # fines owed, by family
npm test
```
