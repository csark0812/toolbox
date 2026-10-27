# Chimney sweep

The customer book for Kernow Sweeps. Every customer is on a six- or twelve-monthly sweep, and at the start of each month we send reminders to everyone whose next sweep falls in it.

The next sweep is due on the same day of the month as the last one, six or twelve months on. If that month is shorter, it is due on the month's last day (a sweep on 31 August is next due on the last day of February).

`data/customers.json` has every customer, the date of their last sweep and their interval in months. Customers from before 2025 were copied across from the old spreadsheet.

```
npm run due -- 2027-02   # everyone due a sweep that month, earliest first
npm test
```
