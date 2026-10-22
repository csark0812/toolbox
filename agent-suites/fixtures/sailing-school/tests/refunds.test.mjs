import assert from 'node:assert/strict'
import { test } from 'node:test'
import { refundFor } from '../src/refunds.mjs'

test('full refund a week or more ahead', () => {
  assert.equal(refundFor(12000, '2026-11-14', '2026-11-07'), 12000)
  assert.equal(refundFor(12000, '2026-11-14', '2026-10-30'), 12000)
})

test('half refund inside the last week', () => {
  assert.equal(refundFor(12000, '2026-11-14', '2026-11-10'), 6000)
  assert.equal(refundFor(12000, '2026-11-14', '2026-11-13'), 6000)
})

test('nothing on or after the start day', () => {
  assert.equal(refundFor(12000, '2026-11-14', '2026-11-14'), 0)
  assert.equal(refundFor(12000, '2026-11-14', '2026-11-15'), 0)
})
