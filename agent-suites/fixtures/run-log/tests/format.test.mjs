import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatDuration, formatKm, formatMiles, paceKm, paceMiles } from '../src/format.mjs'
import { summary } from '../src/summary.mjs'

test('formats distances', () => {
  assert.equal(formatKm(5210), '5.21 km')
  assert.equal(formatMiles(5210), '3.24 mi')
})

test('formats paces', () => {
  assert.equal(paceKm(1623, 5210), '5:12 /km')
  assert.equal(paceMiles(1623, 5210), '8:21 /mi')
})

test('formats durations', () => {
  assert.equal(formatDuration(7445), '2:04:05')
  assert.equal(formatDuration(1623), '27:03')
})

test('summarises runs', () => {
  const runs = [
    { date: '2026-10-01', meters: 5000, seconds: 1500 },
    { date: '2026-10-02', meters: 8000, seconds: 2400 },
  ]
  assert.deepEqual(summary(runs, 'km'), [
    '2 runs, 13.00 km in 1:05:00',
    'average pace 5:00 /km',
    'longest: 2026-10-02, 8.00 km',
  ])
})
