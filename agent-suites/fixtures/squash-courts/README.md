# Squash courts

Court bookings and fees for Riverside Squash Club. Members are billed monthly for the courts they book. `data/bookings.json` has every booking: the court, the member who booked it, when it starts, the players, and where it was booked:

- `desk`: typed into the laptop at the front desk, as the club time on the booking sheet (`2026-10-07 17:00`);
- `online`: copied from the export of the online booking site, which members have been able to use since September.

All court times are club time, which is UK time (Europe/London). The desk laptop has been set to the wrong timezone before, so the fees must come out the same whatever timezone the computer running this is set to.

## Fees

Per court booking, by when it starts:

- Monday to Friday, starting before 17:00: off-peak, £6.00;
- Monday to Friday, starting at 17:00 or later: peak, £9.00;
- Saturday and Sunday: £7.00 at any time;
- junior courts, where every player is a junior: £6.00 at any time. A junior playing with an adult does not change the fee.

```
npm run takings -- 2026-10   # every court booked that month, its fee, and the total
npm test
```
