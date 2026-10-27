import assert from 'node:assert/strict'
import { test } from 'node:test'
import { chargePence, owed } from '../src/charges.mjs'

const room = { id: 'A', name: 'Room A', dayPence: 1000, eveningPence: 1400 }
const booking = (fields) => ({
  id: 'R-1',
  band: 'Test Band',
  room: 'A',
  date: '2026-10-01',
  start: '10:00',
  end: '12:00',
  amp: false,
  paid: false,
  ...fields,
})

test('a daytime session is charged at the day rate', () => {
  assert.equal(chargePence(booking({}), room), 2000)
})

test('an evening session is charged at the evening rate', () => {
  assert.equal(chargePence(booking({ start: '19:00', end: '21:30' }), room), 3500)
})

test('amp hire is added on', () => {
  assert.equal(chargePence(booking({ amp: true }), room), 2400)
})

test('paid sessions are not owed', () => {
  const rows = owed([booking({ paid: true }), booking({ id: 'R-2' })], [room])
  assert.deepEqual(
    rows.map((row) => [row.id, row.pence]),
    [['R-2', 2000]],
  )
})
