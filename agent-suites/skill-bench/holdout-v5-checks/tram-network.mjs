// Hidden acceptance for the journey planner speed-up: the same quickest times as a reference
// Dijkstra on random one-way networks (parallel links, unreachable stops, a stop to itself), valid
// routes, errors for unknown stops, the caller's network untouched, and the frozen timing script
// under target with the same work.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { fastestRoute } = await import(pathToFileURL(join(dir, 'src/planner.mjs')).href)

function reference(network, from, to) {
  const dist = new Map(network.stops.map((stop) => [stop.id, Infinity]))
  dist.set(from, 0)
  const open = new Set(dist.keys())
  while (open.size) {
    let u = null
    for (const id of open) if (u === null || dist.get(id) < dist.get(u)) u = id
    open.delete(u)
    if (dist.get(u) === Infinity) break
    for (const link of network.links)
      if (link.from === u && dist.get(u) + link.minutes < dist.get(link.to))
        dist.set(link.to, dist.get(u) + link.minutes)
  }
  return dist.get(to)
}
let seed = 7
const next = () => (seed = (seed * 48271) % 2147483647)
for (let round = 0; round < 150; round++) {
  const size = 2 + (next() % 14)
  const stops = Array.from({ length: size }, (_, i) => ({ id: `T${i}`, name: `Stop ${i}` }))
  const links = Array.from({ length: next() % (size * 3) }, () => ({
    from: `T${next() % size}`,
    to: `T${next() % size}`,
    minutes: 1 + (next() % 12),
  }))
  const network = { stops, links }
  const frozen = JSON.stringify(network)
  for (let q = 0; q < 6; q++) {
    const from = `T${next() % size}`
    const to = `T${next() % size}`
    const want = reference(network, from, to)
    const got = fastestRoute(network, from, to)
    const label = `round ${round}: ${from} -> ${to}`
    if (want === Infinity) {
      assert.equal(got, null, `${label} is unreachable`)
      continue
    }
    assert.ok(got, `${label} has a route`)
    assert.equal(got.minutes, want, `${label} minutes`)
    assert.equal(got.stops[0], from, `${label} starts at ${from}`)
    assert.equal(got.stops.at(-1), to, `${label} ends at ${to}`)
    let total = 0
    for (let i = 1; i < got.stops.length; i++) {
      const options = links.filter((l) => l.from === got.stops[i - 1] && l.to === got.stops[i])
      assert.ok(options.length, `${label}: no link ${got.stops[i - 1]} -> ${got.stops[i]}`)
      total += Math.min(...options.map((l) => l.minutes))
    }
    assert.equal(total, want, `${label}: the route's links add up to its minutes`)
  }
  assert.equal(JSON.stringify(network), frozen, 'the network is not changed')
  assert.throws(() => fastestRoute(network, 'T0', 'nowhere'), RangeError)
  assert.throws(() => fastestRoute(network, 'nowhere', 'T0'), RangeError)
}
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 110000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 76, 'every journey is still planned')
assert.equal(perf.totalMinutes, 1386, 'the same quickest times')
// Target is 15 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 35, `median ${perf.medianMs} ms is far above the 15 ms target`)
assert.equal(
  execFileSync(process.execPath, ['bin/route.mjs', 'Elm Square', 'Harbour'], {
    cwd: dir,
    encoding: 'utf8',
  }),
  'Elm Square -> Market Street -> Riverside Park -> Harbour (12 min)\n',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
