import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'
import { alertLines, statusLines } from '../src/report.mjs'
import { formatTemp } from '../src/units.mjs'

const now = new Date('2026-10-16T09:00:00Z')
const batch = (fields) => ({
  name: 'Test',
  style: 'pale ale',
  brewed: '2026-10-10',
  originalGravity: 1.05,
  readings: [{ at: '2026-10-15T08:00:00Z', tempC: 19, gravity: 1.02 }],
  ...fields,
})

test('status shows the latest reading and ABV', () => {
  assert.deepEqual(statusLines([batch()], now), ['Test             19.0 °C, SG 1.020, 3.9% ABV'])
})

test('alerts on temperature and age', () => {
  assert.deepEqual(
    alertLines(
      [batch({ readings: [{ at: '2026-10-15T08:00:00Z', tempC: 25, gravity: 1.02 }] })],
      now,
    ),
    ['Test: too warm at 25.0 °C'],
  )
  assert.deepEqual(alertLines([batch({ brewed: '2026-09-01' })], now), [
    'Test: 45 days in the fermenter',
  ])
})

test('lagers may ferment cold', () => {
  const cold = { readings: [{ at: '2026-10-15T08:00:00Z', tempC: 10, gravity: 1.02 }] }
  assert.deepEqual(alertLines([batch({ ...cold, style: 'lager' })], now), [])
  assert.deepEqual(alertLines([batch(cold)], now), ['Test: too cold at 10.0 °C'])
})

test('imperial units', async () => {
  process.env.BREW_UNITS = 'imperial'
  const imperial = await import(`../src/units.mjs?imperial`)
  delete process.env.BREW_UNITS
  assert.equal(imperial.formatTemp(20), '68.0 °F')
  assert.equal(formatTemp(20), '20.0 °C')
})

test('limits come from the environment', () => {
  const run = spawnSync(process.execPath, ['bin/brew.mjs', 'alerts'], {
    cwd: new URL('..', import.meta.url),
    env: {
      ...process.env,
      BREW_NOW: '2026-10-16T09:00:00Z',
      BREW_ALERT_TEMP_MAX: '30',
      NO_COLOR: '1',
    },
    encoding: 'utf8',
  })
  assert.equal(run.status, 1)
  assert.doesNotMatch(run.stdout, /too warm/)
  assert.match(run.stdout, /Cellar Lager: 32 days in the fermenter/)
})
