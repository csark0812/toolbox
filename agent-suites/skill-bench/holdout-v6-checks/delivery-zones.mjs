// Hidden acceptance for the zone assignment speed-up: the same zone as the original ray cast for
// random overlapping polygons and addresses on their corners and edges, priority order kept,
// the caller's zones untouched, and the frozen timing script under target with the same work.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { assignAll, zoneFor } = await import(pathToFileURL(join(dir, 'src/zones.mjs')).href)

function referenceZone(zones, [x, y]) {
  for (const zone of zones) {
    const p = zone.boundary
      .trim()
      .split(/\s+/)
      .map((s) => s.split(',').map(Number))
    let inside = false
    for (let i = 0, j = p.length - 1; i < p.length; j = i++)
      if (
        p[i][1] > y !== p[j][1] > y &&
        x < ((p[j][0] - p[i][0]) * (y - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]
      )
        inside = !inside
    if (inside) return zone.id
  }
  return null
}
let seed = 21
const next = () => (seed = (seed * 48271) % 2147483647)
for (let round = 0; round < 150; round++) {
  const zones = Array.from({ length: 1 + (next() % 6) }, (_, z) => {
    const sides = 3 + (next() % 6)
    const pairs = Array.from({ length: sides }, () => `${next() % 11},${next() % 11}`)
    return { id: `Z${z}`, boundary: (next() % 2 ? '  ' : '') + pairs.join(next() % 2 ? ' ' : '  ') }
  })
  const frozen = JSON.stringify(zones)
  const points = []
  for (let x = -1; x <= 11; x++) for (let y = -1; y <= 11; y++) points.push([x, y])
  for (let k = 0; k < 40; k++) points.push([(next() % 1100) / 100, (next() % 1100) / 100])
  const want = points.map((at) => referenceZone(zones, at))
  points.forEach((at, i) =>
    assert.equal(zoneFor(zones, at), want[i], `round ${round}: ${JSON.stringify(at)} in ${frozen}`),
  )
  const addresses = points.map((at, i) => ({ id: `A${i}`, at }))
  assert.deepEqual(
    assignAll(zones, addresses),
    addresses.map((a, i) => ({ id: a.id, zone: want[i] })),
    `round ${round}: assignAll`,
  )
  assert.equal(JSON.stringify(zones), frozen, "the caller's zones are not changed")
}
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 110000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 697, 'the same addresses are covered')
assert.equal(perf.zonesUsed, 237, 'the same zones are used')
// Target is 20 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 40, `median ${perf.medianMs} ms is far above the 20 ms target`)
const zone = (x, y) =>
  execFileSync(process.execPath, ['bin/zone.mjs', String(x), String(y)], {
    cwd: dir,
    encoding: 'utf8',
  })
assert.equal(zone(350, 250), 'Old Town\n')
assert.equal(zone(400, 100), 'outside every zone\n')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
