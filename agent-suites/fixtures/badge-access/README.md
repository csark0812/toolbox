# Badge access

The door controller logic for our office. Each badge lists the zones it opens (`office`, `lab`, `lab-secure`, `server-room`, ...); each door belongs to one zone. Denied swipes are written to the audit log, which security reviews every morning.

`npm run door -- <badge id> <door id>` simulates a swipe against `data/badges.json` and `data/doors.json`. `npm test` runs the tests.
