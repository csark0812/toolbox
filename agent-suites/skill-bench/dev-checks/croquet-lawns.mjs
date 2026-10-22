// Development check for the lawn-to-green rename: the code says green, while the settings file,
// the bookings export, the --lawn option and every printed line stay exactly as they were.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const run = (...args) =>
  execFileSync(process.execPath, args, { cwd: dir, encoding: 'utf8', stdio: 'pipe' })
const read = (file) => readFileSync(join(dir, file), 'utf8')

assert.deepEqual(
  JSON.parse(read('config/club.json')),
  {
    club: 'Elm Row Croquet Club',
    lawnNames: { A: 'Top lawn', B: 'Orchard lawn', C: 'Pavilion lawn' },
    maxPlayersPerLawn: 4,
    minPlayersPerLawn: 2,
  },
  'the settings file the booking website reads is unchanged',
)
assert.match(
  read('data/bookings.csv'),
  /^date,player,lawn,handicap\n/,
  'the export header is unchanged',
)

const day = `Elm Row Croquet Club, 2026-06-06
Top lawn [A] ok: Ann Pryce (4), Bea Cole (8), Dee Hart (8), Cal Moss (12)
Orchard lawn [B] over: Eli Ford (2), Fay Lund (6), Hal Ings (6), Gus Webb (10), Ivy Shaw (14)
Pavilion lawn [C] short: Jon Tate (9)
`
assert.equal(run('bin/day.mjs', '2026-06-06'), day)
assert.equal(
  run('bin/day.mjs', '2026-06-06', '--lawn', 'B'),
  `Elm Row Croquet Club, 2026-06-06
Orchard lawn [B] over: Eli Ford (2), Fay Lund (6), Hal Ings (6), Gus Webb (10), Ivy Shaw (14)
`,
)
assert.equal(
  run('bin/day.mjs', '2026-06-13'),
  `Elm Row Croquet Club, 2026-06-13
Top lawn [A] ok: Eli Ford (2), Bea Cole (8), Gus Webb (10)
Orchard lawn [B] ok: Ann Pryce (4), Cal Moss (12)
Lawn D [D] ok: Lou Grant (7), Kit Dale (16)
`,
)
assert.equal(
  run('bin/export.mjs'),
  `date,player,lawn,lawn_name
2026-06-06,Ann Pryce,A,Top lawn
2026-06-06,Bea Cole,A,Top lawn
2026-06-06,Cal Moss,A,Top lawn
2026-06-06,Dee Hart,A,Top lawn
2026-06-06,Eli Ford,B,Orchard lawn
2026-06-06,Fay Lund,B,Orchard lawn
2026-06-06,Gus Webb,B,Orchard lawn
2026-06-06,Hal Ings,B,Orchard lawn
2026-06-06,Ivy Shaw,B,Orchard lawn
2026-06-06,Jon Tate,C,Pavilion lawn
2026-06-13,Ann Pryce,B,Orchard lawn
2026-06-13,Cal Moss,B,Orchard lawn
2026-06-13,Kit Dale,D,Lawn D
2026-06-13,Lou Grant,D,Lawn D
2026-06-13,Eli Ford,A,Top lawn
2026-06-13,Bea Cole,A,Top lawn
2026-06-13,Gus Webb,A,Top lawn
`,
)

// The code's own names say green. The loader may still read the old keys to translate them.
const exported = []
for (const file of readdirSync(join(dir, 'src')).filter((f) => f.endsWith('.mjs')))
  exported.push(...Object.keys(await import(pathToFileURL(join(dir, 'src', file)).href)))
assert.ok(
  exported.every((name) => !/lawn/i.test(name)),
  `old names still exported: ${exported.join(', ')}`,
)
assert.ok(
  exported.some((name) => /green/i.test(name)),
  'no exported name uses the new word',
)
for (const file of readdirSync(join(dir, 'bin')).filter((f) => f.endsWith('.mjs')))
  assert.match(read(`bin/${file}`), /green/i, `bin/${file} does not use the new name`)
run('--test')
