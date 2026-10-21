// Development check for the seat rename: the data and core code use `seat` only, while the three
// commands other people depend on print exactly what they printed before.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
const dir = process.argv[2]
const run = (script, ...args) =>
  execFileSync(process.execPath, [`bin/${script}`, ...args], { cwd: dir, encoding: 'utf8' })
const byChair = `Ama Owusu   violin  Chair 1
Finn Doyle  viola   Chair 1
Leo Marsh   cello   Chair 1
Hana Sato   violin  Chair 2
Iris Lam    cello   Chair 2
Bo Strand   violin  Chair 3
`
assert.equal(run('seating.mjs', '--by', 'chair'), byChair)
assert.equal(
  run('seating.mjs', '--principals'),
  `Ama Owusu   violin  Chair 1
Finn Doyle  viola   Chair 1
Leo Marsh   cello   Chair 1
`,
)
assert.equal(
  run('export.mjs'),
  `name,section,chair
Hana Sato,violin,2
Leo Marsh,cello,1
Ama Owusu,violin,1
Finn Doyle,viola,1
Iris Lam,cello,2
Bo Strand,violin,3
`,
)
const players = JSON.parse(readFileSync(join(dir, 'data/players.json'), 'utf8'))
assert.ok(
  players.every((p) => 'seat' in p && !('chair' in p)),
  'the data uses seat',
)
for (const file of readdirSync(join(dir, 'src')))
  assert.doesNotMatch(
    readFileSync(join(dir, 'src', file), 'utf8'),
    /\bchair\b/,
    `src/${file} still uses the old field name`,
  )
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
