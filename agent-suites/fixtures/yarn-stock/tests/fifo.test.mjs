import assert from 'node:assert/strict'
import { test } from 'node:test'
import { costOfSales } from '../src/fifo.mjs'

test('oldest lot first, costed so a used-up lot costs what was paid', () => {
  const { sales, stock } = costOfSales(
    [
      { sku: 'A', date: '2026-01-01', qty: 3, pence: 1000 },
      { sku: 'A', date: '2026-01-05', qty: 2, pence: 500 },
    ],
    [
      { id: 1, sku: 'A', date: '2026-01-02', qty: 1 },
      { id: 2, sku: 'A', date: '2026-01-06', qty: 3 },
    ],
  )
  assert.deepEqual(sales, [
    { id: 1, sku: 'A', cost: 333, short: 0 },
    { id: 2, sku: 'A', cost: 667 + 250, short: 0 },
  ])
  assert.deepEqual(stock, [{ sku: 'A', balls: 1, pence: 250 }])
})

test('a delivery on the sale date is in time; later ones are not', () => {
  const { sales } = costOfSales(
    [
      { sku: 'A', date: '2026-01-05', qty: 2, pence: 400 },
      { sku: 'A', date: '2026-01-06', qty: 2, pence: 400 },
    ],
    [{ id: 1, sku: 'A', date: '2026-01-05', qty: 3 }],
  )
  assert.deepEqual(sales, [{ id: 1, sku: 'A', cost: 400, short: 1 }])
})

test('the stock book is left as it was', () => {
  const purchases = [{ sku: 'A', date: '2026-01-01', qty: 3, pence: 900 }]
  const sales = [{ id: 1, sku: 'A', date: '2026-01-02', qty: 2 }]
  const before = JSON.stringify({ purchases, sales })
  costOfSales(purchases, sales)
  assert.equal(JSON.stringify({ purchases, sales }), before)
})
