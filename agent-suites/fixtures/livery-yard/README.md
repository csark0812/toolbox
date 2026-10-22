# Livery yard

Running the twenty-box livery yard at Coldharbour Farm. `data/horses.json` is written by the owners' app: each horse's box, owner, weight, workload, livery package (full, part or DIY) and hard feed. `config/yard.json` is edited by hand by the yard manager and holds the rates: hay as a share of bodyweight by workload, hay and hard feed prices, hard feed amounts and the weekly livery charges. DIY owners bring their own hay, so their hay is never charged.

`src/feeds.mjs` works out each horse's hay and hard feed and what it costs.

## Commands

```
npm run board                      # the feed board in the tack room
npm run board -- --sort dailyHay   # sorted by any column (the grooms use dailyHay and feedCost)
npm run invoices -- 2026-10        # the month's CSV for the accountant
npm run morning -- 2026-10-22      # the 6am cron: hay to put out today
cd tools/hay-order && npm start    # the weekly hay order (its own little package)
npm test
```

`config/board.json` picks the board's columns and their order. Every command takes another horses file as its last argument.

## Used outside this repo

The vet practice's portal imports `dailyHay` and `feedPlan` from `livery-yard/feeds` (the `exports` map in package.json) to check rations against a horse's condition score. It is their code, not ours, and has to keep working as it does.
