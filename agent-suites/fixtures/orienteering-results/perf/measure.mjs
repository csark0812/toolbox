// Times the results on the whole championship download. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { results } from '../src/results.mjs'
import { makeEvent } from './data.mjs'
const { courses, runners } = makeEvent()
const fingerprint = (out) => JSON.stringify(out)
const expected = fingerprint(results(courses, runners))
const RUNS = 7
const timings = []
let errors = 0
let out = []
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  out = results(courses, runners)
  timings.push(performance.now() - start)
  if (fingerprint(out) !== expected) errors++
}
timings.sort((a, b) => a - b)
const rows = out.flatMap((course) => course.results)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))],
    runs: RUNS,
    errors,
    work: rows.length,
    finishers: rows.filter((row) => row.status === 'OK').length,
    splits: rows.reduce((sum, row) => sum + row.splits.length, 0),
    winners: out.map((course) => course.results[0]?.bib),
  }) + '\n',
)
