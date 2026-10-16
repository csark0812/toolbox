// Times a burst of requests through the router. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { createRouter } from '../src/router.mjs'
import { makeTraffic } from './data.mjs'
const { routes, requests } = makeTraffic()
const router = createRouter(routes)
const route = () => requests.map(([method, url]) => router.match(method, url))
const expected = JSON.stringify(route())
const RUNS = 7
const timings = []
let errors = 0
let results = []
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  results = route()
  timings.push(performance.now() - start)
  if (JSON.stringify(results) !== expected) errors++
}
timings.sort((a, b) => a - b)
const medianMs = timings[3]
stdout.write(
  JSON.stringify({
    medianMs: Number(medianMs.toFixed(2)),
    requestsPerSecond: Math.round(requests.length / (medianMs / 1000)),
    range: [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))],
    runs: RUNS,
    errors,
    work: results.filter(Boolean).length,
  }) + '\n',
)
