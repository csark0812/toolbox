import assert from 'node:assert/strict'
import { test } from 'node:test'
import { courtFee } from '../src/fees.mjs'

const adults = [
  { name: 'A', junior: false },
  { name: 'B', junior: false },
]
const booking = (start, players = adults) => ({
  court: 1,
  member: 'A',
  start,
  players,
  source: 'desk',
})

test('weekday daytime courts are off-peak and evening courts are peak', () => {
  assert.equal(courtFee(booking('2026-10-06 10:00')), 600)
  assert.equal(courtFee(booking('2026-10-06 19:30')), 900)
})

test('weekend courts are the weekend fee', () => {
  assert.equal(courtFee(booking('2026-10-10 19:30')), 700)
  assert.equal(courtFee(booking('2026-10-11 09:00')), 700)
})

test('a court of juniors is the junior fee, but a junior with an adult is not', () => {
  const juniors = [
    { name: 'J', junior: true },
    { name: 'K', junior: true },
  ]
  assert.equal(courtFee(booking('2026-10-06 19:30', juniors)), 600)
  assert.equal(courtFee(booking('2026-10-06 19:30', [adults[0], juniors[0]])), 900)
})
