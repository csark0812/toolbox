import assert from 'node:assert/strict'
import { test } from 'node:test'
import { label } from '../src/dashboard.mjs'
import { shipReady } from '../src/fulfilment.mjs'
import { cancel, createOrder, pay } from '../src/order.mjs'
test('lifecycle labels', () => {
  const order = createOrder(1)
  assert.equal(label(order), 'New')
  assert.equal(label(pay(order)), 'Paid')
  assert.equal(label(shipReady([pay(order)])[0]), 'Shipped')
  assert.equal(label(cancel(order)), 'Cancelled')
})
test('cannot ship unpaid or pay cancelled', () => {
  assert.throws(() => pay(cancel(createOrder(2))))
  assert.equal(label(shipReady([createOrder(3)])[0]), 'New')
})
