import assert from 'node:assert/strict'
import { test } from 'node:test'
import { replay } from '../src/sync.mjs'

test('applies events in order', () => {
  const stock = replay([
    { sku: 'A', type: 'set', qty: 5, at: '1700000000100' },
    { sku: 'A', type: 'remove', qty: 2, at: '1700000000200' },
  ])
  assert.equal(stock.get('A'), 3)
})
