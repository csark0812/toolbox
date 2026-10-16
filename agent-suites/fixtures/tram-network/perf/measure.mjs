// Times a batch of journeys on a synthetic city. Prints one JSON line.
import { performance } from 'node:perf_hooks'
import { stdout } from 'node:process'
import { fastestRoute } from '../src/planner.mjs'
import { makeCity } from './data.mjs'
const { network, pairs } = makeCity()
const plan = () => pairs.map(([from, to]) => fastestRoute(network, from, to))
const minutesOf = (routes) => routes.map((route) => (route ? route.minutes : -1))
const expected = JSON.stringify(minutesOf(plan()))
const RUNS = 7
const timings = []
let errors = 0
let routes = []
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  routes = plan()
  timings.push(performance.now() - start)
  if (JSON.stringify(minutesOf(routes)) !== expected) errors++
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[3].toFixed(2)),
    range: [Number(timings[0].toFixed(2)), Number(timings[RUNS - 1].toFixed(2))],
    runs: RUNS,
    errors,
    work: routes.filter(Boolean).length,
    totalMinutes: routes.reduce((sum, route) => sum + (route ? route.minutes : 0), 0),
  }) + '\n',
)
