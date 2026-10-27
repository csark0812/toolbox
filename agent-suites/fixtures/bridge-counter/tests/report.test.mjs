import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dailyReport } from '../src/report.mjs'

test('totals, peak hour and the seven-day average', () => {
  const rows = dailyReport([
    { at: '2026-05-01T08:00:00Z', count: 30 },
    { at: '2026-05-01T09:00:00Z', count: 30 },
    { at: '2026-05-02T10:00:00Z', count: 5 },
  ])
  assert.deepEqual(rows, [
    { day: '2026-05-01', total: 60, hours: 2, peakHour: 8, rolling7: 60 },
    { day: '2026-05-02', total: 5, hours: 1, peakHour: 10, rolling7: 32.5 },
  ])
})

test('gap days are listed and left out of the average', () => {
  const rows = dailyReport([
    { at: '2026-05-01T08:00:00Z', count: 10 },
    { at: '2026-05-03T08:00:00Z', count: 21 },
  ])
  assert.deepEqual(rows[1], { day: '2026-05-02', total: 0, hours: 0, peakHour: null, rolling7: 10 })
  assert.equal(rows[2].rolling7, 15.5)
})

test('faults are ignored and a resent hour replaces the earlier one', () => {
  const rows = dailyReport([
    { at: '2026-05-01T08:00:00Z', count: 10 },
    { at: '2026-05-01T09:00:00Z', count: null },
    { at: '2026-05-01T10:00:00Z', count: -1 },
    { at: '2026-05-01T08:00:00Z', count: 12 },
  ])
  assert.deepEqual(rows, [{ day: '2026-05-01', total: 12, hours: 1, peakHour: 8, rolling7: 12 }])
})

test('days and hours are UTC', () => {
  const [row] = dailyReport([{ at: '2026-06-02T00:30:00+01:00', count: 4 }])
  assert.equal(row.day, '2026-06-01')
  assert.equal(row.peakHour, 23)
})
