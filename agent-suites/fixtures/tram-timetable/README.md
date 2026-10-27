# Tram timetable

Departure boards for the Southgate tram network. `data/timetable.json` is the published timetable: the stops, the service calendars, the calendar exceptions and every trip with the times it calls at each stop.

- A service runs on the weekdays its `days` pattern names (Monday first, `.` for a day off) between its `from` and `to` dates. An exception for a service and date overrides the calendar; when a date has more than one exception for the same service, the last one listed wins.
- Times are on the service day, so a trip that runs past midnight calls at `24:15` and the board shows `00:15`, after the evening departures. Hours are not always zero-padded in the published file.
- A call marked `"pickup": false` is set-down only, and a trip's last call is where it terminates; neither is a departure. Loop routes can call at the same stop twice, and each call is a departure.
- Each departure shows where the trip terminates. Departures at the same minute are ordered by route number (route `2` before route `10`), then as they are listed in the timetable.
- Every stop gets a board, in the order the stops are listed, even when nothing departs from it that day.

## Usage

```
npm run board -- MKT 2026-11-02   # one stop's board for a date
npm run perf                      # times the boards for the whole network on one day
npm test
```
