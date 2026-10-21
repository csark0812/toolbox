// Hidden acceptance for the bells -> bellCount rename: the data and code use bellCount only (no
// alias for the old field), the unsurveyed tower still defaults to a ring of 6, and the tower
// list (with --sort bells), the CSV export (header and column order included) and the outing
// list print exactly as before.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const towers = JSON.parse(readFileSync(join(dir, 'data/towers.json'), 'utf8'))
assert.deepEqual(
  towers.map((tower) => [tower.name, tower.bellCount]),
  [
    ['St Mary, Thornbury', 8],
    ['St Peter, Frampton', 6],
    ['All Saints, Oldbury', 10],
    ['St John, Aust', undefined],
    ['Holy Trinity, Westerleigh', 5],
    ['St Andrew, Chew', 12],
  ],
  'the data uses bellCount, and the unsurveyed tower still has none',
)
assert.ok(
  towers.every((tower) => !('bells' in tower)),
  'the data no longer has a bells field',
)
const { describe, ringable } = await import(pathToFileURL(join(dir, 'src/towers.mjs')).href)
const tower = { name: 'St Luke', tenor: '12-0-0', practice: 'Sun' }
assert.match(describe({ ...tower, bellCount: 10 }), /10 bells/)
assert.match(describe(tower), / 6 bells/, 'an unsurveyed tower is still a ring of 6')
assert.match(describe({ ...tower, bells: 10 }), / 6 bells/, 'the old field is not read as an alias')
assert.equal(ringable({ ...tower, bellCount: 8 }, 7), false)
assert.equal(ringable({ ...tower, bellCount: 8 }, 8), true)
assert.equal(ringable(tower, 6), true)
assert.equal(ringable({ ...tower, bells: 8 }, 7), true, 'the old field is not read as an alias')

const run = (script, ...args) =>
  execFileSync(process.execPath, [`bin/${script}.mjs`, ...args], { cwd: dir, encoding: 'utf8' })
const line = {
  chew: 'St Andrew, Chew             12 bells  tenor 28-0-26  practice Tue',
  oldbury: 'All Saints, Oldbury         10 bells  tenor 31-2-0   practice Wed',
  thornbury: 'St Mary, Thornbury           8 bells  tenor 24-1-12  practice Tue',
  aust: 'St John, Aust                6 bells  tenor 7-3-20   practice Mon',
  frampton: 'St Peter, Frampton           6 bells  tenor 11-0-3   practice Thu',
  westerleigh: 'Holy Trinity, Westerleigh    5 bells  tenor 9-1-14   practice Fri',
}
const list = (...keys) => keys.map((key) => line[key]).join('\n') + '\n'
assert.equal(
  run('towers', '--sort', 'bells'),
  list('chew', 'oldbury', 'thornbury', 'aust', 'frampton', 'westerleigh'),
  '--sort bells is unchanged',
)
assert.equal(
  run('towers'),
  list('oldbury', 'westerleigh', 'chew', 'aust', 'thornbury', 'frampton'),
  'the default list is unchanged',
)
assert.equal(
  run('towers', '--sort', 'tenor'),
  list('oldbury', 'chew', 'thornbury', 'frampton', 'westerleigh', 'aust'),
  '--sort tenor is unchanged',
)
assert.equal(
  run('export'),
  [
    'name,bells,tenor,practice',
    '"St Mary, Thornbury",8,24-1-12,Tue',
    '"St Peter, Frampton",6,11-0-3,Thu',
    '"All Saints, Oldbury",10,31-2-0,Wed',
    '"St John, Aust",,7-3-20,Mon',
    '"Holy Trinity, Westerleigh",5,9-1-14,Fri',
    '"St Andrew, Chew",12,28-0-26,Tue',
    '',
  ].join('\n'),
  'the CSV export is unchanged',
)
assert.equal(
  run('outing', '7'),
  [
    '3 towers for 7 ringers',
    '  St John, Aust (ring of 6, not surveyed)',
    '  St Peter, Frampton (6)',
    '  Holy Trinity, Westerleigh (5)',
    '',
  ].join('\n'),
)
assert.equal(run('outing', '12').split('\n')[1], '  St Andrew, Chew (12)')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
