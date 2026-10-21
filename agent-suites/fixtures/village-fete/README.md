# Ashcombe village fete

Pitch bookings for the Ashcombe Village Fete, on Saturday 12 June 2027 on the Glebe Field. `data/stalls.json` lists every stall booked so far: who runs it, their phone number, the pitch size, whether they are a charity, how many amps of electric hook-up they need (0 for none), and whether they have cancelled. A cancelled stall stays in the file with `"cancelled": true` so we keep a record of it.

A small pitch (3 metres) is £15 and a large pitch (6 metres) is £30. Registered charities and village groups pay half.

Pitch bookings close on Saturday 29 May. Stall holders can set up from 8am on the day.

## Usage

```
npm run pitches   # every pitch booked, with the holder's phone number and what they owe
npm test
```

See `docs/poster.md` for the poster wording.
