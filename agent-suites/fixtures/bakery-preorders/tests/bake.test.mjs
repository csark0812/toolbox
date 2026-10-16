import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bakeList } from '../src/bake.mjs'

const order = (id, pickup, items) => ({ id, revision: 1, customer: 'x', pickup, items })

test('adds up products for the day', () => {
  const orders = [
    order(1, '2026-12-23T09:00', [{ product: 'stollen', qty: 2 }]),
    order(2, '2026-12-23T10:00', [
      { product: 'stollen', qty: 1 },
      { product: 'bun', qty: 4 },
    ]),
    order(3, '2026-12-24T10:00', [{ product: 'stollen', qty: 5 }]),
  ]
  assert.deepEqual(bakeList(orders, '2026-12-23'), [
    { product: 'bun', qty: 4 },
    { product: 'stollen', qty: 3 },
  ])
})
