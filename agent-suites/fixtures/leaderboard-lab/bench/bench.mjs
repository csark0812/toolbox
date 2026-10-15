// Times summarize() on the production-sized sample. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { summarize } from '../src/summarize.mjs'
import { makeSample } from './sample.mjs'

const RUNS = 7
const records = makeSample()
const expectedIds = new Set(records.map((record) => record.id)).size
const timings = []
let errors = 0
let work = 0
summarize(records) // warmup, not timed
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  const result = summarize(records)
  timings.push(performance.now() - start)
  work = result.length
  if (result.length !== expectedIds) errors++
  for (let index = 1; index < result.length; index++)
    if (result[index - 1].score < result[index].score) {
      errors++
      break
    }
}
timings.sort((a, b) => a - b)
const medianMs = Number(timings[Math.floor(RUNS / 2)].toFixed(2))
const range = [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))]
stdout.write(JSON.stringify({ medianMs, range, runs: RUNS, errors, work }) + '\n')
