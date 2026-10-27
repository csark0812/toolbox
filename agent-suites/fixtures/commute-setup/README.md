# Platform: first-run setup

Platform is a small app that warns commuters about delays on their usual trains in the West of England. People install it from a poster on the platform, open it once on their phone, and either finish setup in under a minute or never come back.

We need the first-run setup screen. The station list is in `data/stations.json`. There is no back end: at the end, keep the choices on the page (saving them in the browser is fine) and show the result.

## Steps

1. **Your stations**: Home station and Work station, both from the station list. They must be different.
2. **Your usual trains**: the time you usually leave home, the time you usually leave work, and which days you travel (at least one; Monday to Friday ticked to start with).
3. **Alerts**: whether to send delay alerts, and how long before the train (5, 10 or 15 minutes). This step can be skipped; skipping leaves alerts on at 10 minutes.

Then a finished screen that sums up the commute in plain words: the two stations, the two times, the days, and the alert setting, with a way to change any of it.

## Rules

- People can go back to any earlier step without losing what they chose.
- If something is missing or wrong, say what and where, next to the field, when they try to continue. Don't move on until it is fixed.
- 300-odd people on a cold platform will use this one-handed. Big targets, no tiny text.

Plain HTML, CSS and JavaScript; no build step. Serve it with any static server (for example `npx serve .`).
