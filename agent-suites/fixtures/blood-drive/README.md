# Blood drive

The booking sheet for the Fenwick Road donor sessions. `data/history.csv` is every donor's history, merged from the main centre's system and the mobile unit's tablets: one line per visit with the donor, the date, the outcome (`donated`, or `deferred` when the nurse sent them home without donating) and the site. `data/appointments.json` is the booked list for each session.

A donor can give whole blood again 84 days after their last donation: someone who gave on 1 September is due on 24 November. A first-time donor is always due.

## Usage

```
npm run clinic -- 2026-11-03   # the booked donors for a session, and whether each is due
npm test
```
