// Times assigning a day's addresses on the full city map. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { assignAll } from '../src/zones.mjs'
import { makeCity } from './data.mjs'
const { zones, addresses } = makeCity()
const assign = () => assignAll(zones, addresses)
const fingerprint = (list) => list.map((entry) => entry.zone ?? '-').join('|')
const expected = fingerprint(assign())
const RUNS = 7
const timings = []
let errors = 0
let list = []
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  list = assign()
  timings.push(performance.now() - start)
  if (fingerprint(list) !== expected) errors++
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))],
    runs: RUNS,
    errors,
    work: list.filter((entry) => entry.zone !== null).length,
    zonesUsed: new Set(list.map((entry) => entry.zone).filter(Boolean)).size,
  }) + '\n',
)
