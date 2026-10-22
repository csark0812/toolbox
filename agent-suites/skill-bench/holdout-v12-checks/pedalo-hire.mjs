// Hidden acceptance for charge() and --takings: strict 24-hour HH:MM times, out from 09:00 to 17:30,
// back later the same day; £6 for the first 30 minutes, £2 for each started 10 minutes after, at most
// £25, plus £10 when back after 18:00; bad times are a RangeError quoting them, non-strings a
// TypeError. The hires command totals finished hires per boat (matched ignoring case, named as in
// data/boats.json), most taken first and in data/boats.json order on a tie, with a total line and the
// boats still out in the order they went out, reports bad hires on stderr, exits 2 for a missing or
// invalid date, writes `pedalo: ` on every stderr line, and is unchanged without the option.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { charge } = await import(pathToFileURL(join(dir, 'src/charge.mjs')).href)

for (const [out, back, pence] of [
  ['09:00', '09:01', 600],
  ['09:00', '09:30', 600],
  ['09:00', '09:31', 800],
  ['09:00', '09:40', 800],
  ['09:00', '09:41', 1000],
  ['11:00', '12:10', 1400],
  ['10:55', '11:26', 800],
  ['13:00', '15:00', 2400],
  ['13:00', '15:01', 2500],
  ['09:00', '17:59', 2500],
  ['12:00', '18:00', 2500],
  ['17:30', '18:00', 600],
  ['17:30', '18:01', 1800],
  ['17:00', '19:30', 3500],
  ['17:30', '23:59', 3500],
  ['16:45', '18:15', 2800],
]) {
  assert.equal(charge(out, back), pence, `${out} to ${back} is ${pence}p`)
}
for (const [out, back, quoted] of [
  ['08:59', '09:30', '08:59'],
  ['17:31', '18:00', '17:31'],
  ['9:30', '10:15', '9:30'],
  ['09:00', '9:45', '9:45'],
  ['09:00', '17:60', '17:60'],
  ['09:00', '24:00', '24:00'],
  ['25:00', '10:00', '25:00'],
  ['09:00', '10:00 ', '10:00 '],
  [' 09:00', '10:00', ' 09:00'],
  ['09.00', '10:00', '09.00'],
  ['0900', '10:00', '0900'],
  ['09:00', '10:00:00', '10:00:00'],
  ['09:00', '10:0', '10:0'],
  ['09:00', '', ''],
  ['09:00', '+10:00', '+10:00'],
  ['14:00', '13:50', '13:50'],
  ['14:00', '14:00', '14:00'],
]) {
  assert.throws(
    () => charge(out, back),
    (error) => error instanceof RangeError && error.message.includes(quoted),
    `${JSON.stringify(out)} to ${JSON.stringify(back)} is refused with a RangeError quoting ${JSON.stringify(quoted)}`,
  )
}
for (const [out, back] of [
  [900, '10:00'],
  ['09:00', 1000],
  ['09:00', null],
  [undefined, '10:00'],
  [{}, '10:00'],
])
  assert.throws(
    () => charge(out, back),
    TypeError,
    `${String(out)}, ${String(back)} is a TypeError`,
  )

const run = (...args) =>
  spawnSync(process.execPath, ['bin/hires.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const listing = [
  'H01  2026-08-15  Swan 1  09:00 to 09:30',
  'H02  2026-08-15  Swan 1  09:45 to 10:16',
  'H03  2026-08-15  swan 1  13:00 to 15:01',
  'H04  2026-08-15  Duck 1  10:00 to 10:40',
  'H05  2026-08-15  Duck 1  11:00 to 12:10',
  'H06  2026-08-15  Duck 1  17:30 to 18:01',
  'H07  2026-08-15  Swan 2  13:00 to 16:00',
  'H08  2026-08-15  Swan 2  16:10 to 16:40',
  'H09  2026-08-15  Duck 2  09:10 to 09:40',
  'H10  2026-08-15  Duck 2  12:00 to 18:00',
  'H11  2026-08-15  Dragon  9:30 to 10:15',
  'H14  2026-08-15  Duck 2  17:05 still out',
  'H12  2026-08-15  DRAGON  16:40 still out',
  'H13  2026-08-15  Pirate  11:00 to 11:30',
  'H15  2026-08-15  Swan 1  16:00 to 17:60',
  'H16  2026-08-15  Duck 1  14:00 to 13:50',
  'H20  2026-08-16  Dragon  10:00 to 10:30',
]
const plain = run()
assert.equal(plain.stdout, listing.join('\n') + '\n', 'without the option the list is unchanged')
assert.equal(plain.status, 0)
const stderrLines = (result) => result.stderr.split('\n').filter((line) => line.trim())

const day = run('--takings', '2026-08-15')
assert.equal(day.status, 0, '--takings 2026-08-15 exits 0')
// The prompt does not say whether `Still out:` names a boat as on the sheet (DRAGON) or as in
// data/boats.json (Dragon), so that line is compared ignoring case.
const ignoreCaseOfLast = (text) => text.replace(/^Still out: .*$/m, (line) => line.toLowerCase())
assert.equal(
  ignoreCaseOfLast(day.stdout),
  ignoreCaseOfLast(
    [
      'Duck 1  3 hires  £40.00',
      'Swan 1  3 hires  £39.00',
      'Swan 2  2 hires  £31.00',
      'Duck 2  2 hires  £31.00',
      'Total  £141.00',
      'Still out: Dragon (since 16:40), Duck 2 (since 17:05)',
    ].join('\n') + '\n',
  ),
  '--takings 2026-08-15',
)
const errors = stderrLines(day)
for (const line of errors) assert.match(line, /^pedalo: /, 'stderr lines start with "pedalo: "')
for (const [id, what] of [
  ['H11', '9:30'],
  ['H13', 'Pirate'],
  ['H15', '17:60'],
  ['H16', 'H16'],
])
  assert.ok(
    errors.some((line) => line.includes(id) && line.includes(what)),
    `${id} is on stderr with ${what}`,
  )
for (const id of ['H01', 'H03', 'H06', 'H10', 'H12', 'H14'])
  assert.ok(!errors.some((line) => line.includes(id)), `${id} is not on stderr`)

const quiet = run('--takings', '2026-08-16')
assert.equal(quiet.status, 0)
assert.equal(quiet.stdout, 'Dragon  1 hire  £6.00\nTotal  £6.00\n', '--takings 2026-08-16')
assert.equal(stderrLines(quiet).length, 0, 'a clean day writes nothing on stderr')

const empty = run('--takings', '2026-08-17')
assert.equal(empty.status, 0)
assert.equal(empty.stdout, 'No hires on 2026-08-17.\n', 'a day with no hires')

for (const args of [
  ['--takings'],
  ['--takings', '2026-08-32'],
  ['--takings', '2026-02-29'],
  ['--takings', '2026-00-15'],
  ['--takings', '2026-8-15'],
  ['--takings', '15/08/2026'],
  ['--takings', '2026-08-15T12:00'],
  ['--takings', '2026-08-15 '],
  ['--takings', 'yesterday'],
]) {
  const result = run(...args)
  assert.equal(result.status, 2, `${JSON.stringify(args)} exits 2`)
  assert.equal(result.stdout, '', `${JSON.stringify(args)} prints nothing on stdout`)
  const lines = stderrLines(result)
  assert.ok(lines.length > 0, `${JSON.stringify(args)} explains itself on stderr`)
  for (const line of lines) assert.match(line, /^pedalo: /, 'stderr lines start with "pedalo: "')
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
