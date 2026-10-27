import assert from 'node:assert/strict'
import { test } from 'node:test'
import { orderLine } from '../src/orders.mjs'

const order = {
  id: 'R301',
  date: '2026-11-06',
  customer: 'Corner Café',
  status: 'open',
  lines: [
    { bean: 'Huila', weight: '1kg 500g' },
    { bean: 'Sidamo', weight: '250g' },
  ],
}

test('an order shows its id, roast date, customer and lines', () => {
  assert.equal(orderLine(order), 'R301  2026-11-06  Corner Café    1kg 500g Huila, 250g Sidamo')
})

test('a cancelled order says so', () => {
  assert.match(orderLine({ ...order, status: 'cancelled' }), /Corner Café {4}\(cancelled\) 1kg/)
})
