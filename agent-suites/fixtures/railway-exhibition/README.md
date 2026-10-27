# Railway exhibition

Everything for the Wexcombe Model Railway Club's annual exhibition, on Saturday 13 March 2027 at Wexcombe Village Hall. Alan Moss runs it; the committee signs off anything that goes out.

- `data/show.json` has the show's dates and times, the hall and the council's booking reference for it (`venueRef`, which is the council's and only changes if they issue a new one).
- `data/ticket-listing.json` is what we upload to the ticket site. Its times are Unix timestamps in seconds.
- `data/exhibitors.csv` lists the layouts coming, their stand, the day they set up, and how long their PAT certificate lasts.
- `templates/` are the ticket and the exhibitor letter. `npm run letters` prints a letter for every exhibitor.
- `web/index.html` is built from `web/index.template.html` by `npm run build:web`. Edit the template, not the built page.
- `calendar/show.ics` is the invite we send members.
- `docs/` has the poster copy, the club calendar and past shows.

## Usage

```
npm run countdown              # days to go
npm run ticket -- "Ann Smith" Adult
npm run letters                # every exhibitor letter
npm run build:web
npm test
```
