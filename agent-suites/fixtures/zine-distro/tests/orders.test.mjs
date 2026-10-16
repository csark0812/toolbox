import assert from 'node:assert/strict'
import { test } from 'node:test'
import { exportCsv, importSheet } from '../src/csv.mjs'
import { invoice, lineTotal } from '../src/orders.mjs'
import { picklist } from '../src/picklist.mjs'

const orders = [
  {
    id: 'A',
    shop: 'x',
    lines: [
      { sku: 'Z-001', qty: 2 },
      { sku: 'Z-007', qty: 1 },
    ],
  },
  { id: 'B', shop: 'y', lines: [{ sku: 'Z-001', qty: 3 }] },
]

test('line and order totals', () => {
  assert.equal(lineTotal({ qty: 3, unitPence: 250 }), 750)
  assert.equal(invoice(orders[0]).total, 900)
})

test('pick list adds copies across orders', () => {
  assert.deepEqual(
    picklist(orders).map((line) => [line.sku, line.qty]),
    [
      ['Z-001', 5],
      ['Z-007', 1],
    ],
  )
})

test('pick list sorted by copies, most first', () => {
  assert.equal(picklist(orders, 'qty')[0].sku, 'Z-001')
  assert.throws(() => picklist(orders, 'price'), RangeError)
})

test('reads a re-order sheet', () => {
  assert.deepEqual(importSheet('order,sku,qty\nA,Z-012,4\n'), [
    { order: 'A', sku: 'Z-012', qty: 4 },
  ])
  assert.throws(() => importSheet('order,sku,qty\nA,Z-012,0\n'), RangeError)
})

test('exports an order as CSV', () => {
  assert.equal(exportCsv(orders[1]), 'sku,title,qty,unitPence\nZ-001,Bike Repair Basics #3,3,250\n')
})
