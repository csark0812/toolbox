import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bill, hireCharge, lateFee } from '../src/pricing.mjs'

const booking = (overrides) => ({
  craft: 'single',
  out: '10:00',
  due: '12:00',
  returned: '11:00',
  ...overrides,
})

test('hire is per started hour', () => {
  assert.equal(hireCharge(booking({ due: '12:30' })), 3600)
  assert.throws(() => hireCharge(booking({ craft: 'canoe' })), RangeError)
})

test('no late fee when back early', () => {
  assert.equal(lateFee(booking({ returned: '11:59' })), 0)
})

test('late fee for a late return', () => {
  assert.equal(lateFee(booking({ returned: '12:40' })), 1500)
})

test('the late fee comes out of the deposit', () => {
  assert.deepEqual(bill(booking({ returned: '12:40' })), {
    hire: 2400,
    deposit: 2500,
    late: 1500,
    refund: 1000,
  })
})
