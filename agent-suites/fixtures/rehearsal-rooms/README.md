# Rehearsal rooms

The bookings book for Kiln Street Rehearsal Rooms, run by Dee Okonjo. Bands book a room by the session; most pay on account at the end of the month.

- `data/rooms.json` has the rooms and their hourly rates, in pence.
- `data/bookings.json` is every booking: band, room, date, start and end time, whether they hired the amp, and whether it has been paid. A cancelled booking has a `cancelledAt` timestamp (local time, `YYYY-MM-DDTHH:MM`) for when the band let us know.
- `data/closures.json` lists the days we're shut. They show as CLOSED on the week sheet.
- `docs/house-rules.md` is what bands are sent when they book: opening hours, rates, amp hire, cancellations.

## Rates

| Room   | Daytime (to 18:00) | Evening (from 18:00) |
| ------ | ------------------ | -------------------- |
| Room A | £10 an hour        | £14 an hour          |
| Room B | £8 an hour         | £12 an hour          |

Amp hire is £4 a session.

## Usage

```
npm run week -- 2026-10-19   # the week sheet for the week starting that Monday
npm run owed                 # every session not yet paid for
npm test
```
