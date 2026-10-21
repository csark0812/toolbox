# Scout badges

Badge records for the 3rd Ashby Scout Group. `data/awards.json` has one record per badge awarded:

- `bc`: the badge code, for example `NAV`
- `nm`: the badge name
- `lvl`: the stage, 1 to 5, for staged badges
- `scout`: the member's number
- `at`: the date it was presented

`data/sections.json` says which stages each section works towards.

## Usage

```
npm run awards -- S014   # one scout's badges, highest stage first
npm run census           # the census CSV for the district office's import
npm run section -- Cubs  # the awards a section can present
npm test
```
