# Window cleaning

The round and the accounts for Sparkle Windows. `data/customers.json` has each customer's address, how often they're cleaned (every 4 or 8 weeks) and their price. `data/cleans.json` is every clean we've done and `data/payments.json` every payment we've taken, by card, bank transfer or cash (cash is entered on the phone at the door).

A customer is due again the given number of weeks after their last clean, and goes on the round for the week (Monday to Sunday) that date falls in.

Customers can ring us on 07700 900118.

## Usage

```
npm run round -- 2026-11-02   # who's due in the week starting that Monday
npm run owed                  # who still owes us, and how much
npm test
```
