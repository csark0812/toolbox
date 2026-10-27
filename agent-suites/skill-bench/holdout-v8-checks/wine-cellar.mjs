// Hidden acceptance for the drink-next speed-up: the same list in the same order as the original
// search on random cellars (producer spellings, ties on score and closing date, window edges),
// the frozen timing script under target with the same work, and the work committed on the branch.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { drinkNext } = await import(pathToFileURL(join(dir, 'src/next.mjs')).href)

const DAY = 24 * 60 * 60 * 1000
const producerKey = (name) => name.trim().toLowerCase()
const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
function reference(cellar, today) {
  const now = new Date(`${today}T00:00:00Z`)
  const list = []
  for (const bottle of cellar) {
    const opens = new Date(`${bottle.opens}T00:00:00Z`)
    const closes = new Date(`${bottle.closes}T00:00:00Z`)
    if (opens > now || closes < now) continue
    const sameVintage = cellar
      .filter(
        (other) =>
          producerKey(other.producer) === producerKey(bottle.producer) &&
          other.vintage === bottle.vintage,
      )
      .sort((a, b) => b.score - a.score || byText(a.id, b.id))
    list.push({
      id: bottle.id,
      wine: `${bottle.producer.trim()} ${bottle.wine} ${bottle.vintage}`,
      rank: sameVintage.findIndex((other) => other.id === bottle.id) + 1,
      daysLeft: Math.round((closes - now) / DAY),
    })
  }
  return list.sort((a, b) => {
    const closesA = new Date(`${cellar.find((bottle) => bottle.id === a.id).closes}T00:00:00Z`)
    const closesB = new Date(`${cellar.find((bottle) => bottle.id === b.id).closes}T00:00:00Z`)
    return closesA - closesB || a.rank - b.rank || byText(a.id, b.id)
  })
}
let seed = 11
const next = () => (seed = (seed * 48271) % 2147483647)
const pad = (n) => String(n).padStart(2, '0')
const day = (offset) => {
  const at = new Date(Date.UTC(2026, 9, 20) + offset * DAY)
  return `${at.getUTCFullYear()}-${pad(at.getUTCMonth() + 1)}-${pad(at.getUTCDate())}`
}
const names = ['Ridge', 'RIDGE', ' ridge ', 'Ch. Musar', 'ch. musar', 'Kanonkop']
for (let round = 0; round < 300; round++) {
  const count = next() % 20
  const ids = Array.from({ length: count }, (_, i) => `B${pad(i)}`).sort(() => (next() % 3) - 1)
  const cellar = ids.map((id) => {
    const opens = next() % 20
    return {
      id,
      producer: names[next() % names.length],
      wine: ['Rouge', 'Blanc'][next() % 2],
      vintage: 2010 + (next() % 3),
      score: 88 + (next() % 4),
      opens: day(opens),
      closes: day(opens + (next() % 15)),
    }
  })
  const today = day(next() % 30)
  const frozen = JSON.stringify(cellar)
  assert.deepEqual(
    drinkNext(cellar, today),
    reference(cellar, today),
    `round ${round}: ${frozen} on ${today}`,
  )
  assert.equal(JSON.stringify(cellar), frozen, "the caller's cellar is not changed")
}
assert.equal(
  execFileSync(process.execPath, ['bin/next.mjs', '2026-11-01'], { cwd: dir, encoding: 'utf8' }),
  [
    'B008  Felton Road Block 3 Pinot Noir 2018     #1     0 days left',
    'B007  domaine huet Clos du Bourg 2019         #1    29 days left',
    'B006  Domaine Huet Le Mont Sec 2019           #2    29 days left',
    'B003  CH. MUSAR Blanc 2012                    #3    60 days left',
    'B001  Ch. Musar Rouge 2012                    #2   425 days left',
    'B002  ch. musar Rouge 2012                    #1  1521 days left',
    "B004  Tyrrell's Vat 1 Semillon 2015           #1  3347 days left",
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
assert.equal(perf.work, 1289, 'the same number of bottles listed')
assert.equal(perf.firsts, 92, 'the same ranks')
// Target is 10 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 25, `median ${perf.medianMs} ms is far above the 10 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
