# Bowls club

The rink sheet for Abbey Road Bowls Club's indoor green. Captains send rink requests to the match secretary, who keeps them in `data/requests.json`: the team, the rink, the date and the session (`morning`, `afternoon` or `evening`). The green has six rinks, numbered 1 to 6; rink 6 opened this season.

Requests are taken in the order they arrived. A request gets its rink unless another team already has that rink in that session, or the rink does not exist.

## Usage

```
npm run sheet -- 2026-11-14   # who is on each rink that day, and the requests turned down
npm test
```
