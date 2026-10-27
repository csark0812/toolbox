import assert from 'node:assert/strict'
import { test } from 'node:test'
import { owed } from '../src/accounts.mjs'
import { nextDue, round } from '../src/round.mjs'

const customers = [
  { id: 'A', address: '1 High Street', name: 'Ann', every: 4, pence: 1000 },
  { id: 'B', address: '2 High Street', name: 'Bob', every: 8, pence: 1500 },
]
const cleans = [
  { customer: 'A', date: '2026-09-02' },
  { customer: 'A', date: '2026-10-07' },
  { customer: 'B', date: '2026-09-09' },
]

test('a customer is due weeks after their latest clean', () => {
  assert.equal(nextDue(customers[0], cleans), '2026-11-04')
  assert.equal(nextDue(customers[1], cleans), '2026-11-04')
})

test('the round is the customers due that week', () => {
  assert.deepEqual(
    round(customers, cleans, '2026-11-02').map((customer) => customer.id),
    ['A', 'B'],
  )
  assert.deepEqual(round(customers, cleans, '2026-11-09'), [])
})

test('payments come off what is owed', () => {
  const rows = owed(customers, cleans, [{ customer: 'A', pence: 1000, method: 'card' }])
  assert.deepEqual(
    rows.map((row) => [row.id, row.balance]),
    [
      ['A', 1000],
      ['B', 1500],
    ],
  )
})
