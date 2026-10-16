import assert from 'node:assert/strict'
import { test } from 'node:test'
import { paidMinutes, split } from '../src/pool.mjs'

test('a break comes off long shifts only', () => {
  assert.equal(paidMinutes({ in: '10:00', out: '16:00' }), 360)
  assert.equal(paidMinutes({ in: '10:00', out: '18:00' }), 450)
})

test('shares follow points and leftover pennies go to the fund', () => {
  const { shares, leftover } = split(
    [
      { name: 'A', role: 'server', in: '10:00', out: '13:00' },
      { name: 'B', role: 'server', in: '10:00', out: '13:00' },
      { name: 'C', role: 'server', in: '10:00', out: '13:00' },
    ],
    100,
  )
  assert.deepEqual(
    shares.map((s) => s.pence),
    [33, 33, 33],
  )
  assert.equal(leftover, 1)
})
