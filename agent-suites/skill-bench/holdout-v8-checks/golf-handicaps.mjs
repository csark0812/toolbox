// Hidden acceptance for the handicap history speed-up: the same index after every round as the
// original on random club records (name spellings, same-day rounds, the 3 and 20 round edges,
// unknown courses), the frozen timing script under target with the same work, and the work
// committed on the branch.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { handicapHistory } = await import(pathToFileURL(join(dir, 'src/handicap.mjs')).href)

const playerKey = (name) => name.trim().toLowerCase()
const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
function differential(round, courses) {
  const course = courses.find((entry) => entry.name === round.course)
  if (!course) throw new Error(`Unknown course ${round.course} in round ${round.id}`)
  return Math.round(((round.gross * 10 - course.rating) * 113) / course.slope)
}
function reference(rounds, courses) {
  return rounds.map((round) => {
    const upTo = rounds
      .filter(
        (other) =>
          playerKey(other.player) === playerKey(round.player) &&
          (new Date(other.date) < new Date(round.date) ||
            (other.date === round.date && byText(other.id, round.id) <= 0)),
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date) || byText(a.id, b.id))
      .slice(-20)
    if (upTo.length < 3) return { round: round.id, index: null }
    const best = upTo
      .map((other) => differential(other, courses))
      .sort((a, b) => a - b)
      .slice(0, Math.max(1, Math.floor(upTo.length * 0.4)))
    return {
      round: round.id,
      index: Math.round(best.reduce((sum, value) => sum + value, 0) / best.length),
    }
  })
}
const outcome = (fn) => {
  try {
    return { value: fn() }
  } catch (error) {
    return { error: String(error.message) }
  }
}
const courses = [
  { name: 'Old Course', rating: 712, slope: 131 },
  { name: 'Heath', rating: 689, slope: 118 },
]
let seed = 17
const next = () => (seed = (seed * 48271) % 2147483647)
const pad = (n) => String(n).padStart(2, '0')
const names = ['Ann Kerr', 'ANN KERR', ' ann kerr ', 'Tom Hale', 'tom hale']
for (let round = 0; round < 250; round++) {
  const count = next() % 50
  const ids = Array.from({ length: count }, (_, i) => `R${pad(i)}`).sort(() => (next() % 3) - 1)
  const rounds = ids.map((id) => ({
    id,
    player: names[next() % names.length],
    date: `2026-${pad(1 + (next() % 3))}-${pad(1 + (next() % 9))}`,
    course: next() % 40 === 0 ? 'Moor' : ['Old Course', 'Heath'][next() % 2],
    gross: 70 + (next() % 25),
  }))
  const frozen = JSON.stringify(rounds)
  assert.deepEqual(
    outcome(() => handicapHistory(rounds, courses)),
    outcome(() => reference(rounds, courses)),
    `round ${round}: ${frozen}`,
  )
  assert.equal(JSON.stringify(rounds), frozen, "the caller's rounds are not changed")
}
assert.equal(
  execFileSync(process.execPath, ['bin/history.mjs', 'Ann Kerr'], { cwd: dir, encoding: 'utf8' }),
  [
    '2026-09-05  R001  Old Course  88  index -',
    '2026-09-12  R003  Heath       84  index -',
    '2026-09-19  R004  Links       95  index 14.5',
    '2026-09-26  R005  Old Course  86  index 12.8',
    '2026-10-03  R008  Heath       81  index 12.2',
    '2026-10-03  R007  Old Course  90  index 13.7',
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
assert.equal(perf.work, 1276, 'the same number of indexes')
assert.equal(perf.total, 75453, 'the same indexes')
// Target is 10 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 25, `median ${perf.medianMs} ms is far above the 10 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
