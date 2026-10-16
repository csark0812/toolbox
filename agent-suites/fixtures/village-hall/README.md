# Village hall

Room bookings for Elmbridge village hall: the main hall and the small room. `data/bookings.json` is the bookings secretary's diary.

The hall is open from 08:00 and closes at 22:00; every booking has to fit inside those hours. A room takes one booking at a time.

## Usage

```
npm run request -- main 2026-10-22 18:00 19:30   # can this room be booked then?
npm run week -- 2026-10-19                        # the week starting that Monday
npm test
```

Rooms are `main` (Main hall) and `small` (Small room).
