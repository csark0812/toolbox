// Hidden acceptance for the short harvest totals: the export's quoted fields (scale B writes its
// decimal-comma weights in quotes) are read as one field each, every crate counts on its day,
// tare rows still count for nothing, and the tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const run = (day) =>
  execFileSync(process.execPath, ['bin/totals.mjs', day], { cwd: dir, encoding: 'utf8' })
assert.equal(
  run('2026-10-10'),
  [
    'Harvest for 2026-10-10',
    '  Joss     82.5 kg  £24.75',
    '  Mina     64.0 kg  £19.20',
    '  Ravi     40.0 kg  £12.00',
    '',
  ].join('\n'),
  'Saturday totals',
)
assert.equal(
  run('2026-10-11'),
  [
    'Harvest for 2026-10-11',
    '  Joss     31.5 kg  £9.45',
    '  Mina     29.0 kg  £8.70',
    '  Ravi     28.5 kg  £8.55',
    '',
  ].join('\n'),
  'Sunday totals',
)
const { parseCsv } = await import(pathToFileURL(join(dir, 'src/csv.mjs')).href)
const { dayTotals } = await import(pathToFileURL(join(dir, 'src/totals.mjs')).href)
const rows = parseCsv(
  [
    'time,picker,variety,kg,scale',
    '2026-10-12 08:00,Ola,"Cox, late",,B',
    '2026-10-12 08:10,Ola,"Cox, late","11,5",B',
    '2026-10-12 08:20,Ola,Bramley,9.5,A',
    '2026-10-12 08:30,Pip,"Russet, Egremont","10,0",B',
    '2026-10-12 08:40,Pip,Bramley,7,B',
  ].join('\n'),
)
assert.equal(rows[1].variety, 'Cox, late', 'a quoted field with a comma is one field')
assert.equal(rows[1].scale, 'B', 'the columns after a quoted field stay in place')
assert.equal(rows[3].scale, 'B')
assert.deepEqual(
  dayTotals(rows, '2026-10-12').map(({ picker, kg, pence }) => [picker, kg, pence]),
  [
    ['Ola', 21, 630],
    ['Pip', 17, 510],
  ],
  'decimal-comma weights count in full and tare rows count for nothing',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
