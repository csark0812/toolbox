# Boat syndicate

The accounts for the _Merry Dancer_, a narrowboat owned by a syndicate of twelve. Members book the boat and log their trips; the treasurer enters the bills. `data/books.json` is a small sample of the books.

`statements(members, trips, costs)` in `src/statements.mjs` gives every member their share of every cost:

- **hours** costs (fuel, engine servicing) are split by how long each member had the boat out during the cost's period, both ends included. Hours are logged to the nearest six minutes, so each trip is rounded to a tenth of an hour before anything is added up. Trips by people who aren't members (guests on someone's booking) don't count. If nobody took the boat out in the period, the cost is split by shares instead.
- **shares** costs (the mooring) are split by each member's shares, which is 1 unless they bought a double share.
- **equal** costs (insurance, the insurer's rebate) are split equally.
- Shares and equal splits only include members who were in the syndicate for some of the period; if nobody was, everyone shares it.
- Everything is in whole pence. Each member gets the floor of their exact share and the pennies left over go one at a time to the largest remainders, earlier members on the list first when remainders tie, so a cost always adds up exactly. Rebates are negative costs and are split the same way.

The members' web page keeps the books in memory and recalculates the statements every time someone opens it; logging a trip or entering a bill adds to the same lists in place, so a statement must always reflect the books as they stand at that moment.

## Usage

```
npm run statements   # statements for data/books.json
npm run perf         # times the statements on four seasons of books
npm test
```
