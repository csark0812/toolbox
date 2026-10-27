import assert from 'node:assert/strict'
import { test } from 'node:test'
import { chargeFor, isMember } from '../src/charges.mjs'

const ada = { name: 'Ada', type: 'adult', expires: '2025-11-20' }
const byName = new Map([['Ada', ada]])

test('a member is current before their expiry date and lapsed after it', () => {
  assert.equal(isMember(ada, '2025-11-01'), true)
  assert.equal(isMember(ada, '2025-12-01'), false)
})

test('members pay the member rate, visitors and cancellations do not', () => {
  assert.equal(chargeFor({ date: '2025-11-01', name: 'Ada', status: 'booked' }, byName), 600)
  assert.equal(chargeFor({ date: '2025-11-01', name: 'Bo', status: 'booked' }, byName), 1400)
  assert.equal(chargeFor({ date: '2025-11-01', name: 'Ada', status: 'cancelled' }, byName), 0)
})
