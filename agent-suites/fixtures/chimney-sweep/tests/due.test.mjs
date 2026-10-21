import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dueIn, nextSweep } from '../src/due.mjs'

test('the next sweep is on the same day of the month', () => {
  assert.equal(nextSweep('2026-08-12', 6), '2027-02-12')
  assert.equal(nextSweep('2026-02-05', 12), '2027-02-05')
})

test('the month list is earliest first', () => {
  const customers = [
    { id: 'C2', name: 'B', lastSwept: '2026-08-20', interval: 6 },
    { id: 'C1', name: 'A', lastSwept: '2026-08-03', interval: 6 },
    { id: 'C3', name: 'C', lastSwept: '2026-09-03', interval: 6 },
  ]
  assert.deepEqual(
    dueIn(customers, '2027-02').map((customer) => customer.id),
    ['C1', 'C2'],
  )
})
