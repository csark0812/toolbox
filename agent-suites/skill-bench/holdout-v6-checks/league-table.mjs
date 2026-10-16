// Hidden acceptance for the position chart speed-up: the same tables as a from-scratch reference
// on random seasons (fixtures out of round order, unplayed fixtures, every tie-break), each
// round's table independent of the others, the caller's season untouched, and the frozen timing
// script under target with the same work. Work is committed on the branch.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { progression, standingsAfter } = await import(
  pathToFileURL(join(dir, 'src/standings.mjs')).href
)

function reference(season, round) {
  const rows = season.teams.map((team) => {
    const row = { team, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 }
    for (const f of season.fixtures) {
      if (f.round > round || f.homeGoals === null || (f.home !== team && f.away !== team)) continue
      const [s, c] = f.home === team ? [f.homeGoals, f.awayGoals] : [f.awayGoals, f.homeGoals]
      row.played++
      row.goalsFor += s
      row.goalsAgainst += c
      if (s > c) row.won++
      else if (s === c) row.drawn++
      else row.lost++
    }
    row.goalDifference = row.goalsFor - row.goalsAgainst
    row.points = row.won * 3 + row.drawn
    return row
  })
  rows.sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.team.localeCompare(b.team),
  )
  return rows.map((row, i) => ({ position: i + 1, ...row }))
}
const KEYS = [
  'position',
  'team',
  'played',
  'won',
  'drawn',
  'lost',
  'goalsFor',
  'goalsAgainst',
].concat(['goalDifference', 'points'])
const shape = (table) => table.map((row) => KEYS.map((key) => row[key]))
let seed = 9
const next = () => (seed = (seed * 48271) % 2147483647)
for (let n = 0; n < 150; n++) {
  const teams = Array.from({ length: 2 + (next() % 7) }, (_, i) => `Club ${'QWERTYUIOP'[i]}`)
  const fixtures = Array.from({ length: next() % 30 }, () => {
    const home = teams[next() % teams.length]
    let away = teams[next() % teams.length]
    if (away === home) away = teams[(teams.indexOf(home) + 1) % teams.length]
    const unplayed = next() % 6 === 0
    return {
      round: 1 + (next() % 8),
      home,
      away,
      homeGoals: unplayed ? null : next() % 3,
      awayGoals: unplayed ? null : next() % 3,
    }
  })
  const season = { teams, fixtures }
  const frozen = JSON.stringify(season)
  const tables = progression(season)
  const last = Math.max(0, ...fixtures.map((f) => f.round))
  assert.equal(tables.length, last, `season ${n}: one table per round`)
  for (let r = 1; r <= last; r++)
    assert.deepEqual(shape(tables[r - 1]), shape(reference(season, r)), `season ${n} round ${r}`)
  for (const r of [0, 1 + (next() % 9)])
    assert.deepEqual(
      shape(standingsAfter(season, r)),
      shape(reference(season, r)),
      `season ${n} after ${r}`,
    )
  if (tables.length > 1) {
    const before = JSON.stringify(tables[0])
    for (const row of tables.at(-1)) row.points = -1
    assert.equal(JSON.stringify(tables[0]), before, `season ${n}: tables do not share rows`)
  }
  assert.equal(JSON.stringify(season), frozen, "the caller's season is not changed")
}
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 110000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 368, 'every round is still charted')
assert.equal(perf.championPoints, 662, 'the same final tables')
// Target is 10 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 25, `median ${perf.medianMs} ms is far above the 10 ms target`)
assert.match(
  execFileSync(process.execPath, ['bin/table.mjs', 'data/season.json', '--round', '3'], {
    cwd: dir,
    encoding: 'utf8',
  }),
  /1 {2}Canal Street {6}3 {2}3 {2}0 {2}0 {4}8 {3}2 {3}6 {4}9\n/,
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
