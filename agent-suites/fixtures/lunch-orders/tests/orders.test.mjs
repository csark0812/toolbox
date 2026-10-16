import assert from 'node:assert/strict'
import { test } from 'node:test'
import { kitchenSheet, ordersFor } from '../src/orders.mjs'

const order = (dish, date = '2026-10-15', time = '09:00') => ({
  person: 'x',
  dish,
  office: 'north',
  date,
  time,
})

test('counts dishes, most popular first', () => {
  assert.deepEqual(kitchenSheet([order('soup'), order('wrap'), order('wrap')]), [
    { dish: 'wrap', count: 2 },
    { dish: 'soup', count: 1 },
  ])
})

test('picks the orders for a day', () => {
  assert.equal(ordersFor([order('soup'), order('wrap', '2026-10-16')], '2026-10-15').length, 1)
})
