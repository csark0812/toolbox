// Development check for job-card times: toMinutes reads hours, minutes or hours then minutes, with
// h/hr and m/min in either case (mixed case too, as the real cards are written) and an optional
// space, and refuses the rest with a RangeError; --totals prints each mechanic's summed time,
// names only the unreadable card on stderr and exits 0, and the plain listing is unchanged.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { toMinutes } = await import(pathToFileURL(join(dir, 'src/time.mjs')).href)
for (const [text, minutes] of [
  ['2h', 120],
  ['2H', 120],
  ['3hr', 180],
  ['3 HR', 180],
  ['45m', 45],
  ['45M', 45],
  ['40min', 40],
  ['40 Min', 40],
  ['1h 30m', 90],
  ['1 h 30 m', 90],
  ['1h 15M', 75],
  ['1HR 5MIN', 65],
  ['1Hr 59Min', 119],
])
  assert.equal(toMinutes(text), minutes, JSON.stringify(text))
for (const bad of [
  '1h 60m',
  '',
  'ages',
  '1.5h',
  '-5m',
  '1h 30',
  'h',
  '30m 1h',
  '5',
  '2 hours',
  '45s',
]) {
  assert.throws(() => toMinutes(bad), RangeError, JSON.stringify(bad))
  if (bad.trim())
    assert.throws(
      () => toMinutes(bad),
      (error) => error.message.includes(bad),
      `the message quotes ${JSON.stringify(bad)}`,
    )
}
for (const bad of [42, null, undefined]) assert.throws(() => toMinutes(bad), String(bad))
const cli = (...args) =>
  spawnSync(process.execPath, ['bin/jobs.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const totals = cli('--totals')
assert.equal(totals.status, 0, `--totals exits 0: ${totals.stderr}`)
assert.equal(totals.stdout, 'Ana: 3h 50m\nTom: 1h 50m\nPriya: 1h 55m\n', '--totals stdout')
assert.match(totals.stderr, /106/, 'the unreadable card is named on stderr')
for (const card of ['101', '102', '103', '104', '105', '107', '108'])
  assert.doesNotMatch(totals.stderr, new RegExp(card), `card ${card} is readable`)
const plain = cli()
assert.equal(
  plain.stdout,
  [
    '#101 Ana: Brompton, 1h 30m',
    '#102 Tom: Raleigh, 45m',
    '#103 Ana: Trek, 2h',
    '#104 Priya: Dawes, 40 Min',
    '#105 Tom: Cube, 1HR 5MIN',
    '#106 Priya: Genesis, ages',
    '#107 Ana: Specialized, 20m',
    '#108 Priya: Carrera, 1h 15M',
    '',
  ].join('\n'),
)
assert.equal(plain.stderr, '', 'the plain listing writes nothing to stderr')
assert.equal(spawnSync(process.execPath, ['--test'], { cwd: dir }).status, 0, 'tests pass')
