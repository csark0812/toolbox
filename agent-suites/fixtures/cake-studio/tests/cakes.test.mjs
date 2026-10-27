import assert from 'node:assert/strict'
import test from 'node:test'
import { quote, servingsFor } from '../bin/quote.mjs'
import { orderSheet, tierServings } from '../src/order-sheet.mjs'
import { findOrder } from '../src/orders.mjs'

test('quote portions round down', () => {
  assert.equal(servingsFor({ shape: 'round', size: 9 }, 'wedding'), 63)
  assert.equal(servingsFor({ shape: 'square', size: 10 }, 'party'), 25)
  assert.throws(() => servingsFor({ shape: 'round', size: 9 }), /Unknown portion style/)
})

test('kitchen portions', () => {
  assert.equal(tierServings({ shape: 'round', size: 9 }, { style: 'wedding' }), 64)
  assert.equal(tierServings({ shape: 'heart', size: 8 }, {}), 51)
})

test('quote total', () => {
  assert.equal(quote(findOrder('C-302')).total, 6340)
})

test('kitchen sheet', () => {
  assert.match(orderSheet(findOrder('C-301')), /Tier 2: 9" round, 2 sponges, cut 64/)
})
