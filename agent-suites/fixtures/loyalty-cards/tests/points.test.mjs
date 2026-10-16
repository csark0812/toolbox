import assert from 'node:assert/strict'
import { test } from 'node:test'
import { addMonths, expiresOn, replay } from '../src/points.mjs'

test('adds months', () => {
  assert.equal(addMonths('2025-10-20', 12), '2026-10-20')
  assert.equal(addMonths('2024-02-29', 12), '2025-02-28')
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28')
})

test('points last twelve months', () => {
  assert.equal(expiresOn('2025-11-25'), '2026-11-25')
  const events = [{ date: '2025-03-01', type: 'earn', points: 10 }]
  assert.equal(replay(events, '2026-02-28').balance, 10)
  assert.equal(replay(events, '2026-03-01').balance, 0)
})

test('redeeming reduces the balance', () => {
  const events = [
    { date: '2026-01-01', type: 'earn', points: 30 },
    { date: '2026-02-01', type: 'redeem', points: 20 },
  ]
  assert.equal(replay(events, '2026-03-01').balance, 10)
})

test('cannot redeem more than the balance', () => {
  assert.throws(
    () => replay([{ date: '2026-01-01', type: 'redeem', points: 5 }], '2026-02-01'),
    RangeError,
  )
})
