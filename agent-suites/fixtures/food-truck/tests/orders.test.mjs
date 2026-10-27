import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ticket } from '../src/orders.mjs'

const menu = [
  { name: 'Halloumi wrap', pence: 750, kind: 'main', allergens: ['milk', 'gluten'] },
  { name: 'Chips', pence: 300, kind: 'side', allergens: [] },
  { name: 'Chilli jam', pence: 50, kind: 'extra', allergens: [] },
]

test('a ticket prices each line with its extras', () => {
  const order = {
    id: 7,
    name: 'Kit',
    lines: [
      { item: 'Halloumi wrap', qty: 2, extras: ['Chilli jam'] },
      { item: 'Chips', qty: 1 },
    ],
  }
  assert.deepEqual(ticket(order, menu), [
    'Order 7  Kit',
    '  2 x Halloumi wrap + Chilli jam  £16.00',
    '  1 x Chips  £3.00',
    '  Total £19.00',
  ])
})
