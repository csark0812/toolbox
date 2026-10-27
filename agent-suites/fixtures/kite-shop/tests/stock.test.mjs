import assert from 'node:assert/strict'
import { test } from 'node:test'
import { stockLine } from '../src/stock.mjs'

test('formats a stock line', () => {
  assert.equal(
    stockLine({ sku: 'K-101', name: 'Delta kite', onHand: 4, reorderAt: 3 }),
    'K-101  Delta kite: 4 on hand',
  )
})
