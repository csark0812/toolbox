import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bill, price } from '../src/billing.mjs'
import { parseLog } from '../src/log.mjs'

test('drying is charged per started 10 minutes', () => {
  assert.equal(price('dry-25'), 300)
  assert.equal(price('dry-30'), 300)
})

test('a restart is not charged again', () => {
  const entries = parseLog('2026-10-01T09:00,W1,C3,hot,start\n2026-10-01T09:10,W1,C3,hot,restart\n')
  assert.deepEqual(bill(entries, 'C3', '2026-10'), { card: 'C3', programmes: 1, pence: 480 })
})

test('only the asked month is billed', () => {
  const entries = parseLog(
    '2026-09-30T09:00,W1,C3,quick,start\n2026-10-01T09:00,W1,C3,quick,start\n',
  )
  assert.equal(bill(entries, 'C3', '2026-10').programmes, 1)
})
