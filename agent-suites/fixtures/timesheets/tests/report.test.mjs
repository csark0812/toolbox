import assert from 'node:assert/strict'
import { test } from 'node:test'
import { shiftMinutes, weeklyReport } from '../src/report.mjs'
import { isoWeek } from '../src/weeks.mjs'

test('labels ISO weeks', () => {
  assert.equal(isoWeek('2026-09-14'), '2026-W38')
  assert.equal(isoWeek('2026-09-20'), '2026-W38')
  assert.equal(isoWeek('2021-01-03'), '2020-W53')
  assert.equal(isoWeek('2024-12-30'), '2025-W01')
})

test('counts shifts past midnight', () => {
  assert.equal(shiftMinutes('22:00', '06:00'), 480)
  assert.equal(shiftMinutes('09:15', '17:00'), 465)
})

test('groups by person and week', () => {
  const people = [
    { id: 'b', name: 'Bea' },
    { id: 'a', name: 'Al' },
  ]
  const entries = [
    { person: 'b', project: 'x', date: '2026-09-14', start: '00:00', end: '23:00' },
    { person: 'b', project: 'w', date: '2026-09-15', start: '00:00', end: '20:00' },
    { person: 'a', project: 'x', date: '2026-09-21', start: '09:00', end: '10:30' },
    { person: 'z', project: 'x', date: '2026-09-21', start: '09:00', end: '10:30' },
  ]
  assert.deepEqual(weeklyReport(entries, people), {
    rows: [
      { person: 'Al', week: '2026-W39', shifts: 1, hours: 1.5, overtime: 0, projects: 'x' },
      { person: 'Bea', week: '2026-W38', shifts: 2, hours: 43, overtime: 3, projects: 'w, x' },
    ],
    skipped: 1,
  })
})
