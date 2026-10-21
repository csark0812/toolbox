import assert from 'node:assert/strict'
import { test } from 'node:test'
import { alertPeriods } from '../src/alerts.mjs'

const series = (gauge, levels, start = Date.UTC(2026, 10, 9, 6)) =>
  levels.map((level, i) => ({
    gauge,
    at: new Date(start + i * 15 * 60 * 1000).toISOString().slice(0, 16),
    level,
  }))

test('an hour above the threshold starts an alert period', () => {
  assert.deepEqual(alertPeriods(series('A', [3, 3, 3, 3, 3, 1]), { A: 2.5 }), [
    { gauge: 'A', from: '2026-11-09T06:45', to: '2026-11-09T07:00', peak: 3, readings: 2 },
  ])
})

test('a failed reading means four fresh readings are needed', () => {
  assert.deepEqual(alertPeriods(series('A', [3, 3, null, 3, 3, 3]), { A: 2 }), [])
})

test('a mean exactly at the threshold is not an alert', () => {
  assert.deepEqual(alertPeriods(series('A', [2, 2, 2, 2]), { A: 2 }), [])
})
