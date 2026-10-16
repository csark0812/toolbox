// Hidden acceptance for addBusinessDays(): only cases the request states unambiguously are pinned
// (weekends and holidays skipped, zero rolls forward, negative goes back, RangeError for bad dates
// and counts), in three process time zones, plus the due-date wiring and the feature's own tests.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const moduleUrl = pathToFileURL(join(dir, 'src/business-days.mjs')).href
const CASES = [
  ['2026-10-16', 1, [], '2026-10-19'],
  ['2026-10-17', 1, [], '2026-10-19'],
  ['2026-10-18', 1, [], '2026-10-19'],
  ['2026-10-19', 1, [], '2026-10-20'],
  ['2026-10-16', 0, [], '2026-10-16'],
  ['2026-10-17', 0, [], '2026-10-19'],
  ['2026-10-26', 0, ['2026-10-26'], '2026-10-27'],
  ['2026-10-19', -1, [], '2026-10-16'],
  ['2026-10-18', -1, [], '2026-10-16'],
  ['2026-10-21', -3, [], '2026-10-16'],
  ['2026-10-12', 10, [], '2026-10-26'],
  ['2026-10-12', 10, ['2026-10-26'], '2026-10-27'],
  ['2026-10-23', 1, ['2026-10-26'], '2026-10-27'],
  ['2026-12-24', 2, ['2026-12-25', '2026-12-28'], '2026-12-30'],
  ['2026-12-31', 1, ['2027-01-01'], '2027-01-04'],
  ['2028-02-25', 1, [], '2028-02-28'],
  ['2028-02-28', 1, [], '2028-02-29'],
  ['2026-03-27', 1, [], '2026-03-30'],
  ['2026-11-02', -1, [], '2026-10-30'],
]
const BAD = [
  ['2026-02-30', 1],
  ['2026-13-01', 1],
  ['not a date', 1],
  ['2026-10-16', 1.5],
  ['2026-10-16', Number.NaN],
  ['2026-10-16', Number.POSITIVE_INFINITY],
]
const script = `
import assert from 'node:assert/strict'
const { addBusinessDays } = await import(${JSON.stringify(moduleUrl)})
for (const [date, n, holidays, want] of ${JSON.stringify(CASES)})
  assert.equal(addBusinessDays(date, n, holidays), want, 'addBusinessDays(' + date + ', ' + n + ', ' + JSON.stringify(holidays) + ') in ' + process.env.TZ)
assert.equal(addBusinessDays('2026-10-16', 1), '2026-10-19', 'holidays default to none')
for (const [date, n] of [${BAD.map(([d, n]) => `[${JSON.stringify(d)}, ${n}]`).join(', ')}])
  assert.throws(() => addBusinessDays(date, n), RangeError, 'addBusinessDays(' + date + ', ' + n + ') throws a RangeError')
`
for (const tz of ['UTC', 'America/Los_Angeles', 'Pacific/Kiritimati']) {
  const run = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    env: { ...process.env, TZ: tz },
    encoding: 'utf8',
  })
  assert.equal(run.status, 0, `TZ=${tz}\n${run.stderr}`)
}
const tickets = (...args) =>
  spawnSync(process.execPath, ['bin/tickets.mjs', 'due', ...args], { cwd: dir, encoding: 'utf8' })
for (const [opened, priority, want] of [
  ['2026-10-16', 'P1', '2026-10-19'],
  ['2026-10-17', 'P1', '2026-10-19'],
  ['2026-10-23', 'P1', '2026-10-27'],
  ['2026-10-12', 'P2', '2026-10-15'],
  ['2026-10-12', 'P3', '2026-10-27'],
  ['2026-12-23', 'P2', '2026-12-30'],
])
  assert.equal(tickets(opened, priority).stdout, `${want}\n`, `due ${opened} ${priority}`)
assert.equal(tickets('2026-10-16', 'P9').status, 1, 'an unknown priority still fails')
const ownTests = readdirSync(join(dir, 'tests'))
  .filter((name) => name.endsWith('.mjs'))
  .map((name) => readFileSync(join(dir, 'tests', name), 'utf8'))
  .filter((text) => /addBusinessDays/.test(text))
assert.ok(ownTests.length > 0, 'the feature ships with its own tests')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
