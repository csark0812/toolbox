// Hidden acceptance for the missing sweep reminders: February and March list everyone who is due
// (end-of-month sweeps land on the month's last day, intervals copied from the old spreadsheet
// count), leap years and twelve-month intervals come out right, and the tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const due = (month) =>
  execFileSync(process.execPath, ['bin/due.mjs', month], { cwd: dir, encoding: 'utf8' })
assert.equal(
  due('2027-02'),
  [
    'Due in 2027-02: 8',
    '  2027-02-01  C11  Miss Jago      6-monthly',
    '  2027-02-05  C07  Mrs Nance      12-monthly',
    '  2027-02-12  C01  Mrs Hale       6-monthly',
    '  2027-02-20  C04  Mr Rowe        12-monthly',
    '  2027-02-28  C02  Mrs Pengelly   6-monthly',
    '  2027-02-28  C03  Mr Ashe        6-monthly',
    '  2027-02-28  C05  Ms Trelawny    6-monthly',
    '  2027-02-28  C08  Mr Carne       6-monthly',
    '',
  ].join('\n'),
  'February lists everyone due',
)
assert.equal(
  due('2027-03'),
  [
    'Due in 2027-03: 4',
    '  2027-03-02  C13  Mrs Eddy       12-monthly',
    '  2027-03-03  C06  Mr Bray        6-monthly',
    '  2027-03-30  C10  Mr Hocking     6-monthly',
    '  2027-03-31  C09  Mrs Polglase   12-monthly',
    '',
  ].join('\n'),
  'March lists everyone due and nobody from February',
)
assert.equal(due('2027-04'), 'Due in 2027-04: 1\n  2027-04-14  C12  Mr Tonkin      6-monthly\n')
const { nextSweep } = await import(pathToFileURL(join(dir, 'src/due.mjs')).href)
for (const [last, months, next] of [
  ['2026-08-31', 6, '2027-02-28'],
  ['2027-08-31', 6, '2028-02-29'],
  ['2027-08-30', 6, '2028-02-29'],
  ['2028-02-29', 12, '2029-02-28'],
  ['2028-02-29', 6, '2028-08-29'],
  ['2025-12-31', 6, '2026-06-30'],
  ['2026-03-31', 6, '2026-09-30'],
  ['2026-05-31', 6, '2026-11-30'],
  ['2026-07-31', 6, '2027-01-31'],
  ['2026-08-31', 12, '2027-08-31'],
  ['2026-12-15', 12, '2027-12-15'],
  ['2026-02-28', 6, '2026-08-28'],
])
  assert.equal(nextSweep(last, months), next, `${last} + ${months} months`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
