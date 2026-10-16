// Hidden acceptance for the bird survey totals: repeat walks and repeat counts on one walk all
// add up, rows identical in every column are still counted once, and the report is unchanged in
// shape.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { tally } = await import(pathToFileURL(join(dir, 'src/tally.mjs')).href)

const run = (...args) =>
  execFileSync(process.execPath, ['bin/tally.mjs', 'data/spring-2026.csv', ...args], {
    cwd: dir,
    encoding: 'utf8',
  })
assert.equal(
  run('--site', 'B'),
  'Site B\n    14  robin\n    11  goldfinch\n     9  blue tit\n',
  'site B totals',
)
assert.equal(
  run(),
  [
    'Site A',
    '     6  blackbird',
    '     4  wren',
    '     3  chiffchaff',
    'Site B',
    '    14  robin',
    '    11  goldfinch',
    '     9  blue tit',
    'Site C',
    '    40  swift',
    '',
  ].join('\n'),
  'every site',
)

// Random sightings against a reference: identical rows count once, everything else adds up.
let seed = 11
const next = () => (seed = (seed * 48271) % 2147483647)
const pick = (list) => list[next() % list.length]
for (let round = 0; round < 200; round++) {
  const rows = Array.from({ length: next() % 25 }, () => ({
    date: pick(['2026-04-04', '2026-04-11', '2026-04-18']),
    site: pick(['A', 'B']),
    observer: pick(['Tom', 'Priya']),
    species: pick(['wren', 'robin', 'swift']),
    count: 1 + (next() % 4),
  }))
  const want = new Map()
  const seen = new Set()
  for (const r of rows) {
    const key = JSON.stringify([r.date, r.site, r.observer, r.species, r.count])
    if (seen.has(key)) continue
    seen.add(key)
    const key2 = `${r.site}|${r.species}`
    want.set(key2, (want.get(key2) ?? 0) + r.count)
  }
  const got = new Map()
  for (const [site, species] of tally(rows.map((r) => ({ ...r }))))
    for (const [name, count] of species) got.set(`${site}|${name}`, count)
  assert.deepEqual(
    Object.fromEntries([...got].sort()),
    Object.fromEntries([...want].sort()),
    `round ${round}`,
  )
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
