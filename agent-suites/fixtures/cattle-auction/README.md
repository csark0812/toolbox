# Cattle auction

Sale results for Hexham Mart's store cattle sales. The ring clerk's file and the online bidding platform are merged into `data/bids.json`: the lot, the bidder's paddle, the amount in whole pounds and the time. `data/lots.json` lists the lots in sale order with their reserve and the time the hammer fell, `data/bidders.json` the registered bidders and `data/retractions.json` the bids withdrawn at the rostrum.

Rules for a lot:

- A bid counts if it was made at or before the hammer, by a registered bidder (paddles are matched ignoring case and spaces, so ` p14` is P14), and has not been withdrawn. A retraction withdraws every bid that bidder made on that lot up to and including the time of the retraction.
- The highest counting bid wins; on equal amounts the earlier bid wins, and on the same second the one listed first.
- The lot is sold if the winning bid reaches the reserve. Otherwise it is not sold, and the highest bid is still reported.
- The buyer pays a 2.5% premium on top, rounded to the penny.

## Usage

```
npm run results   # each lot's result and what each buyer owes
npm run perf      # times the results on a full day's sale
npm test
```
