# Youth club rota

The half-term rota for Polruan Youth Club: juniors (8 to 11), seniors (12 to 16) and the under-8s mornings.

## Safeguarding rules

Every adult working at a session, the lead and every helper, must have a valid enhanced DBS check on the day of the session, and each session needs at least two adults with a valid check.

A check is valid for three years from its issue date: a certificate issued on 1 March 2023 covers sessions up to and including 28 February 2026. A volunteer on the DBS Update Service is covered for as long as their Update Service subscription is paid up; it is renewed once a year and `update_until` is the last day it covers.

`data/volunteers.csv` has each volunteer's certificate issue date (blank if they have never had a check), whether they are on the Update Service, and when their subscription runs out. `data/rota.csv` has one row per session, with the lead and the helpers (separated by `;`).

`npm run rota-check` goes through the rota and flags any session that breaks the rules. The rota goes out to parents once it is clear.

## Usage

```
npm run rota-check
npm test
```
