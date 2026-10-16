import assert from 'node:assert/strict'
import { test } from 'node:test'
import { firstOnWeekday, timetable } from '../src/schedule.mjs'
import { formatLocal, zonedToUtc } from '../src/zone.mjs'

const vinyasa = {
  id: 'v',
  name: 'Vinyasa',
  weekday: 'Tue',
  time: '18:00',
  timeZone: 'America/Chicago',
  starts: '2026-09-01',
}

test('finds the first session weekday', () => {
  assert.equal(firstOnWeekday('2026-09-01', 'Tue'), '2026-09-01')
  assert.equal(firstOnWeekday('2026-09-02', 'Tue'), '2026-09-08')
})

test('converts a wall-clock time to UTC', () => {
  assert.equal(
    zonedToUtc('2026-09-01', '18:00', 'America/Chicago').toISOString(),
    '2026-09-01T23:00:00.000Z',
  )
  assert.equal(
    formatLocal(new Date('2026-09-01T23:00:00Z'), 'America/Chicago'),
    'Tue 2026-09-01 18:00',
  )
})

test('lists the weekly sessions in a window', () => {
  const rows = timetable([vinyasa], '2026-09-14', 14)
  assert.deepEqual(
    rows.map((row) => row.label),
    ['Tue 2026-09-15 18:00  Vinyasa', 'Tue 2026-09-22 18:00  Vinyasa'],
  )
})
