# Laundrette

Monthly bills for the account customers of Suds on Silver Street. Every machine writes a line to `data/machines.log` when a programme starts: the time, the machine, the customer's card, the programme and `start`. When the attendant restarts a programme after a fault the machine writes the same line again with `restart`, and a restart is not charged. `data/customers.json` lists the account customers by card.

Prices: quick wash £3.20, standard £4.10, hot £4.80, and drying £1.00 for every started 10 minutes (`dry-25` is £3.00).

## Usage

```
npm run bills -- 2026-10   # each account customer's bill for the month
npm test
```
