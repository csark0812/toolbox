// Hidden acceptance for arrears() and --arrears, run in Europe/London so clock changes count:
// every due date from firstUnpaid up to and including today is owed, due on the unit's day or the
// month's last day when the month is shorter (without drifting after a short month), with 7 days'
// grace, then £5 for each started week, at most £30 a month; bad units are refused with a RangeError
// naming the unit, a bad today with a RangeError quoting it, and non-objects with a TypeError; the
// units command lists who owes anything, most first and by unit id on a tie, with a total line or the
// no-arrears line, names bad units on stderr and leaves them out, exits 2 for a missing or invalid
// date, writes `store: ` on every stderr line, and is unchanged without the option.
process.env.TZ = 'Europe/London'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { arrears } = await import(pathToFileURL(join(dir, 'src/arrears.mjs')).href)
const unit = (dueDay, firstUnpaid, rent = 1000) => ({
  id: 'X9',
  tenant: 'Test',
  rent,
  dueDay,
  firstUnpaid,
})
const owed = (u, today) => {
  const { months, fees, total } = arrears(u, today)
  return { months, fees, total }
}
for (const [u, today, months, fees] of [
  [unit(31, '2026-01-31'), '2026-01-30', 0, 0],
  [unit(31, '2026-01-31'), '2026-01-31', 1, 0],
  [unit(31, '2026-01-31'), '2026-02-07', 1, 0],
  [unit(31, '2026-01-31'), '2026-02-08', 1, 500],
  [unit(31, '2026-01-31'), '2026-02-14', 1, 500],
  [unit(31, '2026-01-31'), '2026-02-15', 1, 1000],
  [unit(31, '2026-01-31'), '2026-02-21', 1, 1000],
  [unit(31, '2026-01-31'), '2026-02-22', 1, 1500],
  [unit(31, '2026-01-31'), '2026-02-28', 2, 1500],
  [unit(1, '2026-03-01'), '2026-04-12', 2, 3000],
  [unit(1, '2026-03-01'), '2026-04-13', 2, 3500],
  [unit(1, '2026-03-01'), '2026-04-20', 2, 4000],
  [unit(1, '2026-03-01'), '2026-06-30', 4, 11000],
  [unit(20, '2026-10-20'), '2026-10-27', 1, 0],
  [unit(20, '2026-10-20'), '2026-10-28', 1, 500],
  [unit(21, '2026-10-21'), '2026-11-04', 1, 500],
  [unit(20, '2026-10-20'), '2026-11-04', 1, 1000],
  [unit(25, '2026-03-25'), '2026-04-01', 1, 0],
  [unit(25, '2026-03-25'), '2026-04-02', 1, 500],
  [unit(25, '2026-03-25'), '2026-04-08', 1, 500],
  [unit(25, '2026-03-25'), '2026-04-09', 1, 1000],
  [unit(31, '2026-02-28'), '2026-03-30', 1, 2000],
  [unit(31, '2026-02-28'), '2026-03-31', 2, 2000],
  [unit(31, '2026-04-30'), '2026-05-30', 1, 2000],
  [unit(31, '2026-04-30'), '2026-05-31', 2, 2000],
  [unit(30, '2026-02-28'), '2026-03-29', 1, 2000],
  [unit(30, '2026-02-28'), '2026-03-30', 2, 2000],
  [unit(29, '2027-02-28'), '2027-03-29', 2, 2000],
  [unit(31, '2028-01-31'), '2028-02-28', 1, 1500],
  [unit(31, '2028-01-31'), '2028-02-29', 2, 2000],
  [unit(29, '2028-02-29'), '2028-03-29', 2, 2000],
  [unit(15, '2026-12-15'), '2027-01-15', 2, 2000],
  [unit(31, '2026-12-31'), '2027-01-31', 2, 2000],
  [unit(31, '2026-12-31'), '2026-11-04', 0, 0],
  [unit(15, null), '2026-11-04', 0, 0],
  [unit(28, '2026-10-28', 3500), '2026-11-04', 1, 0],
]) {
  const total = months * u.rent + fees
  assert.deepEqual(
    owed(u, today),
    { months, fees, total },
    `${u.dueDay} from ${u.firstUnpaid} on ${today}`,
  )
}
for (const u of [
  { ...unit(15, '2026-10-15'), rent: 0 },
  { ...unit(15, '2026-10-15'), rent: -100 },
  { ...unit(15, '2026-10-15'), rent: 45.5 },
  { ...unit(15, '2026-10-15'), rent: '4500' },
  { ...unit(15, '2026-10-15'), rent: undefined },
  unit(0, '2026-10-15'),
  unit(32, '2026-10-15'),
  unit(15.5, '2026-10-15'),
  unit('15', '2026-10-15'),
  unit(undefined, '2026-10-15'),
  unit(15, '2026-02-28'),
  unit(31, '2026-03-30'),
  unit(29, '2028-02-28'),
  unit(30, '2026-09-31'),
  unit(15, '2026-9-15'),
  unit(15, '2026-10-15T00:00'),
  unit(15, ''),
  unit(15, 20261015),
]) {
  assert.throws(
    () => arrears(u, '2026-11-04'),
    (error) => error instanceof RangeError && error.message.includes('X9'),
    `${JSON.stringify(u)} is refused with a RangeError naming the unit`,
  )
}
for (const today of ['2026-02-30', '2026-2-01', '2026-13-01', '', '04/11/2026', '2026-11-04 '])
  assert.throws(
    () => arrears(unit(15, '2026-10-15'), today),
    (error) => error instanceof RangeError && error.message.includes(today),
    `today ${JSON.stringify(today)} is refused with a RangeError quoting it`,
  )
for (const value of [null, undefined, 'A1', 42])
  assert.throws(
    () => arrears(value, '2026-11-04'),
    TypeError,
    `${String(value)} is refused with a TypeError`,
  )

const run = (...args) =>
  spawnSync(process.execPath, ['bin/units.mjs', ...args], {
    cwd: dir,
    encoding: 'utf8',
    env: { ...process.env, TZ: 'Europe/London' },
  })
const listing = [
  'A1  Jo Marsh    £45.00/month, due on the 31st  owes from 2026-08-31',
  'A2  Priya Nair  £60.00/month, due on the 15th  paid up',
  'B1  Tom Reid    £35.00/month, due on the 28th  owes from 2026-10-28',
  'B2  Ella Shaw   £35.00/month, due on the 27th  owes from 2026-10-27',
  'B3  Sam Cole    £60.00/month, due on the 21st  owes from 2026-10-21',
  'B4  Max Wood    £30.00/month, due on the 20th  owes from 2026-10-20',
  'C1  Ann Hale    £80.00/month, due on the 30th  owes from 2026-02-28',
  'C2  Mia Cross   £50.00/month, due on the 31st  owes from 2026-12-31',
  'C3  Leo Park    £50.00/month, due on the 15th  owes from 2026-02-28',
  'C4  Raj Dutt    £0.45.5/month, due on the 3rd  owes from 2026-10-03',
  'D1  Kay Moss    £40.00/month, due on the 31st  owes from 2026-09-31',
]
const plain = run()
assert.equal(plain.stdout, listing.join('\n') + '\n', 'without the option the list is unchanged')
assert.equal(plain.status, 0)
const stderrLines = (result) => result.stderr.split('\n').filter((line) => line.trim())
for (const [date, lines] of [
  [
    '2026-11-04',
    [
      'C1  Ann Hale  9 months  £950.00',
      'A1  Jo Marsh  3 months  £185.00',
      'B3  Sam Cole  1 month  £65.00',
      'B2  Ella Shaw  1 month  £40.00',
      'B4  Max Wood  1 month  £40.00',
      'B1  Tom Reid  1 month  £35.00',
      'Total  £1315.00',
    ],
  ],
  ['2026-02-27', ['No arrears on 2026-02-27.']],
]) {
  const result = run('--arrears', date)
  assert.equal(result.status, 0, `--arrears ${date} exits 0`)
  assert.equal(result.stdout, lines.join('\n') + '\n', `--arrears ${date}`)
  const errors = stderrLines(result)
  for (const line of errors) assert.match(line, /^store: /, 'stderr lines start with "store: "')
  for (const id of ['C3', 'C4', 'D1'])
    assert.ok(
      errors.some((line) => line.includes(id)),
      `${id} is named on stderr`,
    )
  for (const id of ['A1', 'A2', 'B1', 'C1', 'C2'])
    assert.ok(
      !errors.some((line) => new RegExp(`\\b${id}\\b`).test(line)),
      `${id} is not on stderr`,
    )
}
for (const args of [
  ['--arrears'],
  ['--arrears', '2026-11-31'],
  ['--arrears', '2026-02-29'],
  ['--arrears', '2026-00-10'],
  ['--arrears', '2026-11-4'],
  ['--arrears', '04/11/2026'],
  ['--arrears', '2026-11-04T09:00'],
  ['--arrears', ' 2026-11-04'],
  ['--arrears', 'today'],
]) {
  const result = run(...args)
  assert.equal(result.status, 2, `${JSON.stringify(args)} exits 2`)
  assert.equal(result.stdout, '', `${JSON.stringify(args)} prints nothing on stdout`)
  const errors = stderrLines(result)
  assert.ok(errors.length > 0, `${JSON.stringify(args)} explains itself on stderr`)
  for (const line of errors) assert.match(line, /^store: /, 'stderr lines start with "store: "')
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
