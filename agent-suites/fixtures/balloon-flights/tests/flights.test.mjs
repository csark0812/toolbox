import assert from 'node:assert/strict'
import { test } from 'node:test'
import { board, seatsLeft } from '../src/flights.mjs'

const flights = [
  {
    id: 'F2',
    date: '2026-11-05',
    site: 'Castle Meadow',
    slot: 'dusk',
    basket: 12,
    booked: 12,
    pilot: 'Ros',
  },
  {
    id: 'F1',
    date: '2026-11-05',
    site: 'Castle Meadow',
    slot: 'dawn',
    basket: 8,
    booked: 6,
    pilot: 'Hal',
  },
]

test('seats left is the basket less the bookings', () => {
  assert.equal(seatsLeft(flights[1]), 2)
})

test('the board lists dawn before dusk', () => {
  assert.deepEqual(board(flights), [
    '2026-11-05  dawn  Castle Meadow  2 left',
    '2026-11-05  dusk  Castle Meadow  0 left',
  ])
})
