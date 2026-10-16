// Hidden acceptance for the clash speed-up: the same clashes in the same order as the original
// pairwise search on random rotas (name spellings, touching and identical shifts, overnight
// shifts, ties), the frozen timing script under target with the same work, and the work
// committed on the branch.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { clashes } = await import(pathToFileURL(join(dir, 'src/clashes.mjs')).href)

const key = (name) => name.trim().toLowerCase()
const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
function reference(shifts) {
  const found = []
  for (let i = 0; i < shifts.length; i++)
    for (let j = i + 1; j < shifts.length; j++) {
      const [a, b] = [shifts[i], shifts[j]]
      if (key(a.crew) !== key(b.crew)) continue
      const [as, ae, bs, be] = [a.start, a.end, b.start, b.end].map((t) => new Date(t).getTime())
      if (!(as < be && bs < ae)) continue
      const aFirst = as < bs || (as === bs && byText(a.id, b.id) < 0)
      const [first, second] = aFirst ? [a, b] : [b, a]
      found.push({ person: key(a.crew), first: first.id, second: second.id })
    }
  const startOf = (id) => new Date(shifts.find((s) => s.id === id).start).getTime()
  return found.sort(
    (x, y) =>
      byText(x.person, y.person) ||
      startOf(x.first) - startOf(y.first) ||
      startOf(x.second) - startOf(y.second) ||
      byText(x.first, y.first) ||
      byText(x.second, y.second),
  )
}
let seed = 9
const next = () => (seed = (seed * 48271) % 2147483647)
const pad = (n) => String(n).padStart(2, '0')
const names = ['Kim Ade', 'KIM ADE', ' kim ade ', 'Ola Berg', 'ola berg', 'Rui Costa']
for (let round = 0; round < 300; round++) {
  const shifts = []
  const count = next() % 18
  const ids = Array.from({ length: count }, (_, i) => `S${pad(i)}`).sort(() => (next() % 3) - 1)
  for (let i = 0; i < count; i++) {
    const day = 10 + (next() % 3)
    const start = 6 * 60 + (next() % 24) * 30
    const end = start + 30 * (1 + (next() % 12))
    const stamp = (m) =>
      `2026-11-${pad(day + Math.floor(m / 1440))}T${pad(Math.floor((m % 1440) / 60))}:${pad(m % 60)}`
    shifts.push({
      id: ids[i],
      crew: names[next() % names.length],
      stage: 'Main',
      start: stamp(start),
      end: stamp(end),
    })
  }
  const frozen = JSON.stringify(shifts)
  assert.deepEqual(clashes(shifts), reference(shifts), `round ${round}: ${frozen}`)
  assert.equal(JSON.stringify(shifts), frozen, "the caller's rota is not changed")
}
assert.equal(
  execFileSync(process.execPath, ['bin/clashes.mjs'], { cwd: dir, encoding: 'utf8' }),
  [
    'kim ade: S101 Main 10-16T14:00-18:00 overlaps S102 Studio 1 10-16T17:30-22:00',
    'kim ade: S102 Studio 1 10-16T17:30-22:00 overlaps S107 Studio 2 10-16T19:00-21:00',
    'rui costa: S105 Studio 2 10-16T19:00-00:30 overlaps S106 Main 10-17T00:00-02:00',
    '',
  ].join('\n'),
)
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 110000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 1289, 'the same number of clashes')
assert.equal(perf.people, 12, 'the same people')
// Target is 10 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 25, `median ${perf.medianMs} ms is far above the 10 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
