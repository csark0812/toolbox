// Hidden acceptance for statusAt and --at: opening minute in and closing minute out, late ranges
// carried into the next day (including Sunday into Monday), the next opening within a week or
// null, TypeErrors quoting malformed ranges, and the CLI's two lines and exit codes.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { statusAt } = await import(pathToFileURL(join(dir, 'src/status.mjs')).href)
const hours = JSON.parse(readFileSync(join(dir, 'data/hours.json'), 'utf8'))
const plain = (value) => JSON.parse(JSON.stringify(value))
const cases = [
  ['2026-10-16T10:00', { open: true, until: '16:00' }],
  ['2026-10-16T08:00', { open: true, until: '16:00' }],
  ['2026-10-16T07:59', { open: false, opens: 'Fri 08:00' }],
  ['2026-10-16T15:59', { open: true, until: '16:00' }],
  ['2026-10-16T16:00', { open: false, opens: 'Fri 18:00' }],
  ['2026-10-16T23:59', { open: true, until: '01:00' }],
  ['2026-10-17T00:30', { open: true, until: '01:00' }],
  ['2026-10-17T01:00', { open: false, opens: 'Sat 09:00' }],
  ['2026-10-18T01:30', { open: true, until: '02:00' }],
  ['2026-10-18T02:00', { open: false, opens: 'Sun 10:00' }],
  ['2026-10-18T15:00', { open: false, opens: 'Tue 08:00' }],
  ['2026-10-19T12:00', { open: false, opens: 'Tue 08:00' }],
  ['2026-10-15T23:00', { open: false, opens: 'Fri 08:00' }],
  ['2026-10-15T18:00', { open: true, until: '23:00' }],
]
for (const [at, want] of cases)
  assert.deepEqual(plain(statusAt(hours, at)), want, `statusAt(${at})`)

const week = (overrides) => ({
  mon: 'closed',
  tue: 'closed',
  wed: 'closed',
  thu: 'closed',
  fri: 'closed',
  sat: 'closed',
  sun: 'closed',
  ...overrides,
})
assert.deepEqual(plain(statusAt(week({}), '2026-10-16T12:00')), { open: false, opens: null })
assert.deepEqual(
  plain(statusAt(week({ tue: '08:00-09:00' }), '2026-10-20T10:00')),
  { open: false, opens: 'Tue 08:00' },
  'a week later on the same weekday',
)
assert.deepEqual(
  plain(statusAt(week({ sun: '22:00-02:00' }), '2026-10-19T01:00')),
  { open: true, until: '02:00' },
  'Sunday night runs into Monday',
)
for (const bad of ['8-16', '25:00-26:00', '16:00-16:00', '09:00-1200'])
  assert.throws(
    () => statusAt(week({ tue: bad }), '2026-10-20T10:00'),
    (error) => error instanceof TypeError && error.message.includes(bad),
    `"${bad}" is refused with a TypeError quoting it`,
  )

const cli = (...args) =>
  spawnSync(process.execPath, ['bin/hours.mjs', ...args], { cwd: dir, encoding: 'utf8' })
assert.equal(cli('--at', '2026-10-17T00:30').stdout, 'Open until 01:00\n')
assert.equal(cli('--at', '2026-10-19T12:00').stdout, 'Closed, opens Tue 08:00\n')
assert.equal(cli('--at', '2026-10-16T16:00').stdout, 'Closed, opens Fri 18:00\n')
for (const bad of [['--at', 'soon'], ['--at', '2026-10-16T25:00'], ['--at']]) {
  const run = cli(...bad)
  assert.equal(run.status, 2, `${bad.join(' ')} exits 2`)
  assert.equal(run.stdout, '', `${bad.join(' ')} prints nothing on stdout`)
  assert.ok(run.stderr.trim(), `${bad.join(' ')} explains on stderr`)
}
assert.equal(
  cli().stdout,
  'Mon  closed\nTue  08:00–16:00\nWed  08:00–16:00\nThu  08:00–16:00, 18:00–23:00\nFri  08:00–16:00, 18:00–01:00\nSat  09:00–02:00\nSun  10:00–15:00\n',
  'the week is unchanged without --at',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
