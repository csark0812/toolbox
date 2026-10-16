import assert from 'node:assert/strict'
import { test } from 'node:test'
import { nightLows, nightReadings } from '../src/night.mjs'
import { celsius } from '../src/units.mjs'

test('converts Fahrenheit readings', () => {
  assert.equal(celsius({ value: 35.6, unit: 'F' }), 2)
  assert.equal(celsius({ value: 2, unit: 'C' }), 2)
  assert.throws(() => celsius({ value: 2, unit: 'K' }), RangeError)
})

test('lowest reading per house over the night', () => {
  const readings = [
    { house: 1, at: '2026-10-15T17:45Z', value: 0, unit: 'C' },
    { house: 1, at: '2026-10-15T23:00Z', value: 3, unit: 'C' },
    { house: 3, at: '2026-10-16T04:00Z', value: 33.8, unit: 'F' },
  ]
  assert.deepEqual(nightLows(nightReadings(readings, '2026-10-15')), [
    [1, 3],
    [3, 1],
  ])
})
