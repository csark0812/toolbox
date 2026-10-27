# Bay chargers

Our office has three shared chargers in the car park (bays A, B and C). Four of us use them and we split the electricity bill by what each person actually used. Every month Nadia does this by hand in a spreadsheet, gets it slightly wrong, and spends a lunch hour arguing about it.

`data/october.json` is the export from the chargers plus the payments people have sent. Next month's export will replace it, so the screen has to work the numbers out from the file.

## Billing rules (agreed at the office meeting)

- Only sessions that **started** in the billing month count, and only sessions with status `complete`. A `failed` session is not billed at all.
- The rate depends on the hour the session started: peak from 07:00 up to (not including) 19:00, off-peak otherwise. Rates are in the file.
- Round each session's energy charge to the nearest penny.
- Idle fee: if a car stays plugged in **more than** the grace period after it finished charging (`chargeEnd` to `unplugged`), that session gets the idle fee. Exactly the grace period is fine.
- Only payments dated in the billing month count against that month.
- Balance = billed for the month − paid in the month. A negative balance means that person is in credit.

## What the screen should show

- The month, the total energy used, the total billed, and how much is still outstanding (the sum of what people owe; credit does not reduce it).
- For each person: billed sessions, kWh, energy charge, idle fees, total, paid and balance, with credit shown clearly as credit.
- Who owes the most.
- The sessions themselves, so anyone can check their own bill line by line.

Plain HTML, CSS and JavaScript; no build step. Open it with any static server (for example `npx serve .`). It will mostly be read on phones in the car park.
