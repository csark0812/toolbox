# Score library

The lending catalogue for the county music library, which hires out sets of orchestral and choral parts to local groups. `data/library.json` has the sets (`pieces`) and every loan since the library went online (`loans`).

`catalogue(pieces, loans, today)` in `src/catalogue.mjs` lists every set:

- In catalogue order: by composer, then title, then id. Composers are written "Surname, Forenames"; a set with no composer (or a blank one) is filed as `Trad.`. Case and accents are ignored (Dvořák files with Dvorak) and numbers read as numbers, so Symphony No. 2 comes before Symphony No. 10.
- With where it is on `today`: a loan with no `returned` date is still out; if a set somehow has two loans open, the one that went out later counts (the later one in the list on the same day). It is `overdue` once its `due` date has passed, `out` before that, and `in` with no open loan.
- With how many times it has been lent (`timesLent`) and when it last went out (`lastLent`).

Dates are `YYYY-MM-DD`. Loans for sets that aren't in the list are ignored.

## Usage

```
npm run catalogue   # the catalogue for data/library.json, as of 21 October 2026
npm run perf        # times the catalogue on the whole library
npm test
```
