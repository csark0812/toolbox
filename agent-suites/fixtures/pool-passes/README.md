# Pool passes

Monthly swim passes at Eastgate Lido. `data/passes.csv` is the front desk's export of every pass sold, with the month it covers and its status.

Prices are £48 for an adult, £30 for a junior and £36 for a senior.

Takings are the money the lido keeps for a month. Cancelled and refunded passes are not counted, because that money goes back to the swimmer.

## Usage

```
npm run takings              # takings for October 2026
npm run takings -- 2026-09   # another month
npm test
```
