import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cartTotal, lineTotal } from '../src/pricing.mjs'

test('prices a line in cents', () => {
  assert.equal(lineTotal({ unitCents: 250, quantity: 2 }), 500)
})

test('sums the cart', () => {
  assert.equal(
    cartTotal([
      { unitCents: 100, quantity: 1 },
      { unitCents: 50, quantity: 3 },
    ]),
    250,
  )
})
