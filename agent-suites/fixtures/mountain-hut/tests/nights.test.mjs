import assert from 'node:assert/strict'
import { test } from 'node:test'
import { addDays } from '../src/dates.mjs'
import { monthNights } from '../src/nights.mjs'

const night = (rows, date) => rows.find((row) => row.night === date)

test('dates roll over the end of a month', () => {
  assert.equal(addDays('2026-07-30', 3), '2026-08-02')
})

test('parties arriving the same day share the night', () => {
  const rows = monthNights(
    [
      { ref: 'A', name: 'A', arrive: '2026-08-05', nights: 2, guests: 12, status: 'confirmed' },
      { ref: 'B', name: 'B', arrive: '2026-08-05', nights: 1, guests: 9, status: 'confirmed' },
    ],
    '2026-08',
  )
  assert.deepEqual(night(rows, '2026-08-05'), { night: '2026-08-05', guests: 21, over: true })
})

test('a cancelled booking frees its bunks', () => {
  const rows = monthNights(
    [{ ref: 'C', name: 'C', arrive: '2026-08-09', nights: 2, guests: 6, status: 'cancelled' }],
    '2026-08',
  )
  assert.equal(night(rows, '2026-08-09').guests, 0)
})
