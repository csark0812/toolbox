// Hidden acceptance for the league table speed-up: the same table as the original on random seasons
// (names in any case and spacing, aliases shared between teams or equal to another team's name where
// the first team listed wins, repeated team names, unregistered teams, replacement sheets under
// another spelling, jokers that are missing, out of range or not whole numbers, shared places,
// more than ten nights with equal league points and nights out of date order), the frozen timing
// script under target with the same work, and the work committed on the branch.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { standings } = await import(pathToFileURL(join(dir, 'src/league.mjs')).href)

const POINTS = [10, 8, 6, 5, 4, 3, 2, 1]
const BEST = 10

const tidy = (name) => name.trim().replace(/\s+/g, ' ').toLowerCase()

/** The registered team a name on the answer sheet belongs to, by its name or one of its aliases. */
function registered(teams, name) {
  return teams.find(
    (team) =>
      tidy(team.name) === tidy(name) ||
      (team.aliases ?? []).some((alias) => tidy(alias) === tidy(name)),
  )
}

/** Each registered team's score and place on one night. A later sheet for a team replaces an earlier one. */
function nightResults(teams, night) {
  const latest = []
  for (const entry of night.entries) {
    const team = registered(teams, entry.team)
    if (!team) continue
    let score = entry.rounds.reduce((sum, points) => sum + points, 0)
    if (Number.isInteger(entry.joker) && entry.joker >= 1 && entry.joker <= entry.rounds.length)
      score += entry.rounds[entry.joker - 1]
    const earlier = latest.findIndex((result) => result.team === team.name)
    if (earlier >= 0) latest.splice(earlier, 1)
    latest.push({ team: team.name, score })
  }
  return latest.map((result) => ({
    ...result,
    place: 1 + latest.filter((other) => other.score > result.score).length,
  }))
}

/** The season's league table. */
function reference(teams, nights) {
  const ordered = [...nights].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  return teams
    .map((team) => {
      const results = []
      for (const night of ordered) {
        const mine = nightResults(teams, night).find((result) => result.team === team.name)
        if (mine)
          results.push({
            points: POINTS[Math.min(mine.place, POINTS.length) - 1],
            quiz: mine.score,
            won: mine.place === 1,
          })
      }
      const counted = [...results].sort((a, b) => b.points - a.points).slice(0, BEST)
      return {
        team: team.name,
        played: results.length,
        points: counted.reduce((sum, result) => sum + result.points, 0),
        quiz: counted.reduce((sum, result) => sum + result.quiz, 0),
        wins: results.filter((result) => result.won).length,
      }
    })
    .sort(
      (a, b) =>
        b.points - a.points || b.quiz - a.quiz || b.wins - a.wins || a.team.localeCompare(b.team),
    )
}

let seed = 59
const next = () => (seed = (seed * 48271) % 2147483647)
const pick = (list) => list[next() % list.length]
const NAMES = [
  'Owls',
  'owls ',
  'The Owls',
  'Pints',
  'Brains',
  'Ada',
  'ada',
  'Zed',
  'Émile',
  'emile',
]
const JOKERS = [undefined, 0, 1, 2, 3, 4, 2.5, '2', -1]
const spell = (name) =>
  pick([
    name,
    name.toUpperCase(),
    ` ${name}`,
    name.replace(' ', '   '),
    `${name}\t`,
    name.toLowerCase(),
  ])
for (let round = 0; round < 300; round++) {
  const teams = Array.from({ length: 1 + (next() % 5) }, () => {
    const team = { name: pick(NAMES) }
    if (next() % 4) team.aliases = Array.from({ length: next() % 3 }, () => pick(NAMES))
    return team
  })
  const spellings = [...teams.flatMap((team) => [team.name, ...(team.aliases ?? [])]), 'Ringers']
  const nights = Array.from({ length: next() % 15 }, () => ({
    date: `2026-10-${String(1 + (next() % 12)).padStart(2, '0')}`,
    entries: Array.from({ length: next() % 7 }, () => ({
      team: spell(pick(spellings)),
      rounds: Array.from({ length: 1 + (next() % 3) }, () => (next() % 7) / 2),
      joker: pick(JOKERS),
    })),
  }))
  const frozen = JSON.stringify({ teams, nights })
  assert.deepEqual(standings(teams, nights), reference(teams, nights), `round ${round}: ${frozen}`)
  assert.equal(JSON.stringify({ teams, nights }), frozen, "the caller's data is not changed")
}
assert.equal(
  execFileSync(process.execPath, ['bin/table.mjs'], { cwd: dir, encoding: 'utf8' }),
  [
    ' 1  Quizzly Bears             23 pts     109 quiz  1 wins  (3 played)',
    ' 2  Universally Challenged    20 pts      82 quiz  2 wins  (2 played)',
    ' 3  Les Quizerables           16 pts    74.5 quiz  0 wins  (2 played)',
    ' 4  agatha quiztie            12 pts      69 quiz  0 wins  (2 played)',
    ' 5  Ernest Quizzle             8 pts      35 quiz  0 wins  (1 played)',
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
assert.equal(perf.work, 37, 'every registered team in the table')
assert.equal(perf.points, 1183, 'the same league points')
assert.equal(perf.played, 743, 'the same nights played')
// Target is 5 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 12, `median ${perf.medianMs} ms is far above the 5 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
