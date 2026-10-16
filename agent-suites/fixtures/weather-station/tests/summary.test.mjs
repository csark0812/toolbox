import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dailySummary, daysBetween, formatDay } from '../src/summary.mjs'
import { toCelsius } from '../src/units.mjs'

test('lists the days in a range', () => {
  assert.deepEqual(daysBetween('2026-10-30', '2026-11-02'), [
    '2026-10-30',
    '2026-10-31',
    '2026-11-01',
    '2026-11-02',
  ])
})

test('summarizes a day', () => {
  const readings = [
    { station: 'north', day: '2026-10-01', celsius: 4 },
    { station: 'north', day: '2026-10-01', celsius: 10 },
    { station: 'north', day: '2026-10-02', celsius: 99 },
  ]
  const [day] = dailySummary(readings, ['2026-10-01'])
  assert.equal(formatDay(day), '2026-10-01  min 4.0  max 10.0  mean 7.0')
})

test('celsius passes through', () => {
  assert.equal(toCelsius(12.5, 'C'), 12.5)
})
