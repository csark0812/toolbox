// Hidden acceptance for the rink sheet: each rink keeps its own bookings (no shared array), rink 6
// can be booked while 0 and 7 cannot, genuine clashes are still turned down, and the tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
assert.equal(
  execFileSync(process.execPath, ['bin/sheet.mjs', '2026-11-14'], { cwd: dir, encoding: 'utf8' }),
  [
    'morning    1: Harriers  2: Kestrels  3: Wrens  4: -  5: -  6: Owls',
    'afternoon  1: Ravens  2: Owls  3: -  4: Kestrels  5: -  6: -',
    'evening    1: -  2: -  3: -  4: -  5: Swifts  6: Harriers',
    'turned down: Swifts, rink 1 morning (rink taken)',
    'turned down: Wrens, rink 7 evening (no such rink)',
    'turned down: Ravens, rink 4 afternoon (rink taken)',
    '',
  ].join('\n'),
  'the 14 November sheet',
)
const { allocate } = await import(pathToFileURL(join(dir, 'src/rinks.mjs')).href)
const ask = (team, rink, session, date = '2026-12-05') => ({ team, rink, date, session })
const problems = (requests) => allocate(requests).map((result) => result.problem)
assert.deepEqual(
  problems([1, 2, 3, 4, 5, 6].map((rink) => ask(`T${rink}`, rink, 'evening'))),
  [null, null, null, null, null, null],
  'all six rinks can be given out in one session',
)
assert.deepEqual(
  problems([
    ask('A', 3, 'morning'),
    ask('B', 3, 'afternoon'),
    ask('C', 3, 'morning'),
    ask('D', 3, 'morning', '2026-12-06'),
  ]),
  [null, null, 'rink taken', null],
  'a clash needs the same rink, date and session',
)
assert.deepEqual(
  problems([ask('A', 0, 'morning'), ask('B', 7, 'morning'), ask('C', 6, 'morning')]),
  ['no such rink', 'no such rink', null],
)
assert.deepEqual(
  problems([ask('A', 2, 'morning')]),
  [null],
  'a second call starts with a free green',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
