import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dailyYield, monthlyYield } from '../src/yield.mjs'

const readings = [
  { date: '2026-08-01', kwh: 100 },
  { date: '2026-08-02', kwh: 112.5 },
  { date: '2026-08-04', kwh: 140 },
  { date: '2026-08-05', kwh: 151.2 },
]

test('each day is the rise since the previous reading', () => {
  assert.deepEqual(dailyYield(readings), [
    { date: '2026-08-02', kwh: 12.5, days: 1 },
    { date: '2026-08-04', kwh: 27.5, days: 2 },
    { date: '2026-08-05', kwh: 11.2, days: 1 },
  ])
})

test('a month is the rise across its readings', () => {
  assert.equal(monthlyYield(readings, '2026-08'), 51.2)
  assert.equal(monthlyYield(readings, '2026-09'), null)
})
