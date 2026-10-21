// Hidden acceptance for the high-water look-up speed-up: the same answers as the original search
// on random tables (port spellings, low waters, exact-minute and tied predictions, unknown ports,
// times after the last high water), the frozen timing script under target with the same work,
// and the work committed on the branch.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { nextHighWaters } = await import(pathToFileURL(join(dir, 'src/tides.mjs')).href)

const portKey = (name) => name.trim().toLowerCase()
const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
function reference(tides, queries) {
  return queries.map((query) => {
    const highs = tides
      .filter((tide) => tide.kind === 'high' && portKey(tide.port) === portKey(query.port))
      .sort((a, b) => new Date(a.time) - new Date(b.time) || byText(a.id, b.id))
    const tide = highs.find((high) => new Date(high.time) > new Date(query.at))
    if (!tide) return { query: query.id, tide: null, minutes: null }
    return {
      query: query.id,
      tide: tide.id,
      minutes: Math.round((new Date(tide.time) - new Date(query.at)) / 60000),
    }
  })
}
let seed = 13
const next = () => (seed = (seed * 48271) % 2147483647)
const pad = (n) => String(n).padStart(2, '0')
const stamp = (m) =>
  `2026-11-${pad(10 + Math.floor(m / 1440))}T${pad(Math.floor((m % 1440) / 60))}:${pad(m % 60)}`
const ports = ['Dartmouth', 'DARTMOUTH', ' dartmouth ', 'Brixham', 'brixham', 'Looe']
for (let round = 0; round < 300; round++) {
  const count = next() % 16
  const ids = Array.from({ length: count }, (_, i) => `T${pad(i)}`).sort(() => (next() % 3) - 1)
  const tides = ids.map((id) => ({
    id,
    port: ports[next() % ports.length],
    kind: next() % 3 ? 'high' : 'low',
    time: stamp((next() % 12) * 120),
    height: 4,
  }))
  const queries = Array.from({ length: 1 + (next() % 6) }, (_, i) => ({
    id: `Q${i}`,
    port: [...ports, 'Fowey'][next() % 7],
    at: stamp((next() % 24) * 60),
  }))
  const frozen = JSON.stringify([tides, queries])
  assert.deepEqual(
    nextHighWaters(tides, queries),
    reference(tides, queries),
    `round ${round}: ${frozen}`,
  )
  assert.equal(JSON.stringify([tides, queries]), frozen, "the caller's tables are not changed")
}
const ask = (...args) =>
  execFileSync(process.execPath, ['bin/ask.mjs', ...args], { cwd: dir, encoding: 'utf8' })
assert.equal(
  ask('Dartmouth', '2026-11-02T09:15'),
  'Next high water at Dartmouth: 2026-11-02 18:31 (4.4 m), in 9 h 16 min\n',
)
assert.equal(
  ask('Dartmouth', '2026-11-02T18:31'),
  'Next high water at DARTMOUTH: 2026-11-03 06:55 (4.5 m), in 12 h 24 min\n',
)
assert.equal(
  ask('brixham', '2026-11-02T19:00'),
  'No high water predicted at brixham after 2026-11-02T19:00.\n',
)
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 110000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 1152, 'the same number of look-ups answered')
assert.equal(perf.minutes, 407802, 'the same answers')
// Target is 5 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 15, `median ${perf.medianMs} ms is far above the 5 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
