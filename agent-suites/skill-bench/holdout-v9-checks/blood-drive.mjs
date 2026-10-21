// Hidden acceptance for the donor session: a deferral is not a donation, the mobile unit's
// unpadded dates are ordered as dates (so Gus, who gave a month ago, is no longer cleared), the
// 84-day rule still counts whole days, and the tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const pad = (date) =>
  date.replace(
    /(\d{4})-(\d{1,2})-(\d{1,2})/g,
    (_, y, m, d) => `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`,
  )
const lines = execFileSync(process.execPath, ['bin/clinic.mjs', '2026-11-03'], {
  cwd: dir,
  encoding: 'utf8',
})
  .trimEnd()
  .split('\n')
  .map((line) => pad(line.replace(/\s+/g, ' ')))
assert.deepEqual(
  lines,
  [
    '09:00 D01 Priya Nair last gave 2026-08-10 due from 2026-11-02 OK',
    '09:15 D02 Tomas Weber last gave 2026-07-30 due from 2026-10-22 OK',
    '09:30 D03 Gus Hale last gave 2026-10-02 due from 2026-12-25 NOT DUE',
    '09:45 D04 Mei Chen last gave 2026-08-11 due from 2026-11-03 OK',
    '10:00 D05 Olu Ade last gave 2026-09-05 due from 2026-11-28 NOT DUE',
    '10:15 D06 Sara Long first donation OK',
    '10:30 D07 Ken Ito last gave 2026-09-09 due from 2026-12-02 NOT DUE',
  ],
  'every booked donor gets the right answer for 3 November',
)
const { dueOn, parseHistory } = await import(pathToFileURL(join(dir, 'src/eligibility.mjs')).href)
const history = parseHistory(
  [
    'donor,date,outcome,site',
    'A,2026-9-30,donated,mobile',
    'A,2026-10-12,deferred,main',
    'B,2026-01-05,donated,main',
    'B,2026-2-1,donated,mobile',
    'B,2026-12-1,deferred,mobile',
    'C,2026-12-01,donated,main',
    'C,2026-9-1,donated,mobile',
  ].join('\n'),
)
assert.equal(dueOn(history, 'A', '2026-12-23').due, true, 'A is due 84 days after 30 September')
assert.equal(dueOn(history, 'A', '2026-12-22').due, false, 'A is not due a day earlier')
assert.equal(pad(dueOn(history, 'B', '2026-04-26').last ?? ''), '2026-02-01', "B's last donation")
assert.equal(dueOn(history, 'B', '2026-04-26').due, true)
assert.equal(dueOn(history, 'B', '2026-04-25').due, false)
assert.equal(pad(dueOn(history, 'C', '2027-01-10').last ?? ''), '2026-12-01', "C's last donation")
assert.equal(dueOn(history, 'C', '2027-01-10').due, false, 'C gave in December')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
