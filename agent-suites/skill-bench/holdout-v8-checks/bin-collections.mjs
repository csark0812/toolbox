// Hidden acceptance for collection dates: nextCollections reads weekly and fortnightly rules in
// any case, counts a collection on the from day, moves one that lands on a bank holiday to the
// next working day without shifting later ones, and refuses bad rules with a RangeError quoting
// them; the street command lists the next collections and refuses bad --next and --from values.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { nextCollections } = await import(pathToFileURL(join(dir, 'src/rounds.mjs')).href)
for (const [rule, from, count, want] of [
  ['weekly on Tue', '2026-12-22', 2, ['2026-12-22', '2026-12-29']],
  ['weekly on tue', '2026-12-23', 1, ['2026-12-29']],
  ['WEEKLY ON TUE', '2026-12-20', 1, ['2026-12-22']],
  ['weekly on Fri', '2026-12-20', 3, ['2026-12-27', '2027-01-02', '2027-01-08']],
  [
    'fortnightly on Mon from 2026-12-14',
    '2026-12-20',
    3,
    ['2026-12-29', '2027-01-11', '2027-01-25'],
  ],
  ['fortnightly on mon from 2026-12-14', '2026-12-01', 2, ['2026-12-14', '2026-12-29']],
  ['fortnightly on Mon from 2026-12-14', '2026-12-15', 1, ['2026-12-29']],
  ['fortnightly on Fri from 2026-10-02', '2026-10-03', 2, ['2026-10-16', '2026-10-30']],
  ['fortnightly on Fri from 2026-10-02', '2027-03-20', 2, ['2027-04-03', '2027-04-16']],
  ['weekly on Mon', '2027-04-04', 2, ['2027-04-06', '2027-04-12']],
  ['weekly on Sun', '2026-11-01', 1, ['2026-11-01']],
])
  assert.deepEqual(nextCollections(rule, from, count), want, `${rule} from ${from}, ${count}`)
for (const rule of [
  'monthly on Tue',
  'weekly on Tuesday',
  'weekly Tue',
  'weekly on Tues',
  'fortnightly on Mon',
  'fortnightly on Tue from 2026-12-14',
  'fortnightly on Mon from 2026-13-01',
  'fortnightly on Mon from 14/12/2026',
  'daily',
  '',
])
  assert.throws(
    () => nextCollections(rule, '2026-12-01', 1),
    (error) => error instanceof RangeError && error.message.includes(rule),
    `${JSON.stringify(rule)} is refused with a RangeError quoting it`,
  )

const run = (...args) =>
  spawnSync(process.execPath, ['bin/street.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const one = run('Mill Lane', '--from', '2026-12-23')
assert.equal(
  one.stdout,
  'Mill Lane: weekly on Tue\n  Tue 29 Dec 2026\n',
  'one collection by default',
)
assert.equal(one.status, 0)
const three = run('station road', '--from', '2026-12-20', '--next', '3')
assert.equal(
  three.stdout,
  'Station Road: weekly on Fri\n  Sun 27 Dec 2026\n  Sat 2 Jan 2027\n  Fri 8 Jan 2027\n',
  '--next 3 with holiday moves',
)
const church = run('Church Row', '--next', '2', '--from', '2026-12-01')
assert.equal(
  church.stdout,
  'Church Row: fortnightly on mon from 2026-12-14\n  Mon 14 Dec 2026\n  Tue 29 Dec 2026\n',
)
assert.equal(run('Mill Lane', '--from', '2026-12-22', '--next', '10').stdout.split('\n').length, 12)
for (const bad of [
  ['--next', '0'],
  ['--next', '11'],
  ['--next', '2.5'],
  ['--next', 'two'],
  ['--next'],
  ['--from', '2026-02-30'],
  ['--from', 'tomorrow'],
]) {
  const result =
    bad[0] === '--from'
      ? run('Mill Lane', ...bad)
      : run('Mill Lane', '--from', '2026-12-22', ...bad)
  assert.equal(result.status, 2, `${bad.join(' ')} exits 2`)
  assert.equal(result.stdout, '', `${bad.join(' ')} prints nothing on stdout`)
  assert.notEqual(result.stderr.trim(), '', `${bad.join(' ')} explains on stderr`)
}
const unknown = run('Nowhere', '--from', '2026-12-22')
assert.equal(unknown.status, 1, 'an unknown street still exits 1')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
