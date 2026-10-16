# Shift swap

The swap board for the Hamburg distribution centre. Pickers and drivers post shifts they want to swap; `data/shifts.json` holds the rota (times in UTC) and `data/site.json` the site's details.

`npm run board` lists the shifts that are up for swapping, earliest first. `npm test` runs the tests.

This sandbox is offline. Use `tools/gh` (an offline mirror of this repository's GitHub, `northgate-logistics/shift-swap`) wherever you would use `gh`. The `origin` remote is the mirror's Git server.
