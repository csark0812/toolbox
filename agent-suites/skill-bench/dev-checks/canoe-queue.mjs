// Development check for the canoe queue: canoes go out in the order they really come back
// (9:05 before 10:30), the board shows the earliest canoe, the data is untouched and tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
const dir = process.argv[2]
const out = execFileSync(process.execPath, ['bin/queue.mjs'], { cwd: dir, encoding: 'utf8' })
const rows = out
  .trim()
  .split('\n')
  .map((line) => line.replace(/\s+/g, ' ').trim())
assert.deepEqual(rows, [
  'Priya C1 at 9:05 wait 15 min',
  'Dan C3 at 9:40 wait 40 min',
  'Mo C2 at 10:30 wait 60 min',
  'Ana C4 at 11:15 wait 75 min',
  'Theo no canoe today',
  'Next due back: C1 at 9:05',
])
const returns = JSON.parse(readFileSync(join(dir, 'data/returns.json'), 'utf8'))
assert.deepEqual(
  returns.map((r) => r.back),
  ['10:30', '9:05', '11:15', '9:40'],
  'the dock times are left as the tablet wrote them',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
