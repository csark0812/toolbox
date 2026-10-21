# Ice rink

Session bookings for the Riverside ice rink. The box office exports `data/sessions.json` every few minutes: each session's day, times, type (public skate, lessons, hockey, disco), how many are booked and the capacity. The export is sometimes mid-write when we read it, which is why the busiest-session screen retries.

Every command takes the sessions file as an optional first argument (default `data/sessions.json`). If it cannot be read, the command says so on stderr and exits 1.

## Usage

```
npm run today -- data/sessions.json 2026-11-07   # one day's sessions
npm run report                                   # bookings by session type for the week
npm run busiest                                  # the fullest session, for the door screen
npm test
```
