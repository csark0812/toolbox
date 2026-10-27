import assert from 'node:assert/strict'
import { test } from 'node:test'
import { orderTotal, pounds } from '../src/orders.mjs'

const prices = { carrots: 120, eggs: 180 }

test('an order costs the sum of its lines', () => {
  const order = {
    items: [
      { product: 'carrots', qty: 3 },
      { product: 'eggs', qty: 1 },
    ],
  }
  assert.equal(orderTotal(order, prices), 540)
})

test('pence show as pounds', () => {
  assert.equal(pounds(540), '£5.40')
})
