# Swim lanes

Early-morning lane hire at Riverside Pool. Clubs book a lane for an hour slot (06:00, 07:00 or 08:00); each lane takes one club per slot. Clubs can cancel a booking, and a cancelled slot is free for anyone else to take.

The front desk screen calls `free(day)` on every refresh, so the pool keeps the day's free slots cached.

## Usage

```
npm run apply -- data/changes.json   # apply the day's bookings and cancellations in order, then show the free slots
npm test
```

`data/changes.json` lists the changes for Saturday 17 October as they came in to the office.
