import assert from 'node:assert/strict'
import { test } from 'node:test'
import { monthRain } from '../src/rain.mjs'
import { ukDay } from '../src/ukdays.mjs'

test('a summer evening tip after 23:00 UTC belongs to the next UK day', () => {
  assert.equal(ukDay('2025-07-14T23:20:00Z'), '2025-07-15')
})

test('winter days are UTC days', () => {
  assert.equal(ukDay('2025-01-14T23:20:00Z'), '2025-01-14')
})

test('the clocks go forward at 01:00 UTC on the last Sunday of March', () => {
  assert.equal(ukDay('2025-03-30T00:30:00Z'), '2025-03-30')
  assert.equal(ukDay('2025-03-29T23:30:00Z'), '2025-03-29')
  assert.equal(ukDay('2025-03-30T23:30:00Z'), '2025-03-31')
})

test('the clocks go back at 01:00 UTC on the last Sunday of October', () => {
  assert.equal(ukDay('2025-10-25T23:30:00Z'), '2025-10-26')
  assert.equal(ukDay('2025-10-26T23:30:00Z'), '2025-10-26')
})

test('tips add up to millimetres and 25 mm is heavy', () => {
  const stamps = Array.from({ length: 125 }, (_, i) =>
    new Date(Date.UTC(2025, 0, 9, 8, 0, i * 20)).toISOString(),
  )
  const day = monthRain(stamps, '2025-01').find((row) => row.day === '2025-01-09')
  assert.deepEqual(day, { day: '2025-01-09', mm: 25, heavy: true })
})
