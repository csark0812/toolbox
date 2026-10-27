// Times the departure boards for the whole network on one day. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { departureBoards } from '../src/boards.mjs'
import { DATE, makeTimetable } from './data.mjs'
const timetable = makeTimetable()
const fingerprint = (boards) => JSON.stringify(boards)
const expected = fingerprint(departureBoards(timetable, DATE))
const RUNS = 7
const timings = []
let errors = 0
let boards = []
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  boards = departureBoards(timetable, DATE)
  timings.push(performance.now() - start)
  if (fingerprint(boards) !== expected) errors++
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))],
    runs: RUNS,
    errors,
    work: boards.length,
    departures: boards.reduce((sum, board) => sum + board.departures.length, 0),
  }) + '\n',
)
