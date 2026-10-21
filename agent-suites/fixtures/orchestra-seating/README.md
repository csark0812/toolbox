# Orchestra seating

The seating plan for the Riverside Community Orchestra. `data/players.json` lists each player with their section and chair number; chair 1 leads the section.

## Usage

```
npm run seating                      # everyone, by name
npm run seating -- --by chair        # by chair, then name
npm run seating -- --principals      # section leaders only
npm run export                       # the plan as CSV for the librarian's spreadsheet
npm test
```
