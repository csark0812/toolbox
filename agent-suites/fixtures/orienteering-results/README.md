# Orienteering results

Results and split analysis for the Sedgemoor night championship. The e-punching download in `data/event.json` has each course's controls in order and, for every runner, their start, finish and the punches their card recorded.

`results(courses, runners)` in `src/results.mjs` works out, for every course in the order given:

- The controls are found in course order among the runner's punches; extra punches (wrong controls, punching one twice) don't matter. A runner who misses a control is a mispunch (`MP`), and one with no finish time didn't finish (`DNF`).
- Clock times are seconds after the runner's start. The event runs past midnight, so any clock earlier than the start is the next morning.
- Finishers are placed by time; equal times share the place and the next place is skipped. Then come mispunches, then non-finishers, each by name. Equal names go by bib.
- Every runner gets their leg times as far as they got (the last leg runs to the finish). Finishers' legs are ranked among the finishers on that course the same way places are; nobody else's legs are ranked.
- `behind` is how far a finisher is behind the course winner.

Runners on a course that isn't in the list are left out; a course with nobody on it still appears.

## Usage

```
npm run results   # the results for data/event.json
npm run perf      # times the results on the whole championship download
npm test
```
