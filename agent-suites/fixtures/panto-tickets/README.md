# Panto tickets

Box-office records for the Riverside Players' December pantomime.

- `data/tickets.csv` lists every ticket: its performance, how it was issued and its price band.
  - `online` tickets are sold by the ticket platform. It keeps 8% of each one and pays the rest to us after the run. A refunded online ticket is paid back to the buyer in full and the platform keeps no fee.
  - `door` tickets are cash sales at the box office, which we bank ourselves.
  - `comp` tickets are free seats for cast families and helpers. Nobody pays for them.
- `data/platform-payouts.csv` is what the platform paid us for each performance.

Prices are £16 adult, £10 child and £12 concession.

## Usage

```
npm run settle    # what the platform should pay us, per performance
npm test
```
