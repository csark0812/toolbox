// Hidden acceptance for the refused telescope slots: each night is scheduled on its own, so
// slots taken on one night are free on the next, repeated calls without options do not share
// state, the real same-night clash is still refused, and the tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const run = (...args) => execFileSync(process.execPath, args, { cwd: dir, encoding: 'utf8' })
const thursday = [
  'Thu 12 Nov',
  '  20:00-21:00  Ivy Chen      booked',
  '  21:00-22:00  Omar Haddad   booked',
  '  21:00-22:00  Ivy Chen      slot taken',
  '  23:00-00:00  Bea Lindqvist booked',
]
const friday = [
  'Fri 13 Nov',
  '  20:00-21:00  Lars Moen     booked',
  '  21:00-22:00  Noor Rahman   booked',
  '  22:00-23:00  Kit Ellery    booked',
]
const saturday = [
  'Sat 14 Nov',
  '  22:00-23:00  Omar Haddad   booked',
  '  23:00-00:00  Bea Lindqvist booked',
  '  01:00-02:00  Ivy Chen      booked',
]
assert.equal(run('bin/nights.mjs'), [...thursday, ...friday, ...saturday, ''].join('\n'), 'nights')
assert.equal(run('bin/night.mjs', '2026-11-14'), [...saturday, ''].join('\n'), 'one night')

const { scheduleNight, slotEnd } = await import(pathToFileURL(join(dir, 'src/schedule.mjs')).href)
const night = (date) => [
  { night: date, slot: '20:00', member: 'A' },
  { night: date, slot: '21:00', member: 'B' },
  { night: date, slot: '20:00', member: 'C' },
]
for (let i = 0; i < 4; i++)
  assert.deepEqual(
    scheduleNight(night(`2026-12-0${i + 1}`)).map((result) => result.status),
    ['booked', 'booked', 'slot taken'],
    `call ${i + 1} without options starts from an empty night`,
  )
const options = { taken: ['21:00'] }
assert.deepEqual(
  scheduleNight(night('2026-12-09'), options).map((result) => result.status),
  ['booked', 'slot taken', 'slot taken'],
  'slots passed in are still respected',
)
assert.deepEqual(
  scheduleNight(night('2026-12-10')).map((result) => result.status),
  ['booked', 'booked', 'slot taken'],
  'a call with options leaves the defaults alone',
)
assert.equal(slotEnd('23:00'), '00:00')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
