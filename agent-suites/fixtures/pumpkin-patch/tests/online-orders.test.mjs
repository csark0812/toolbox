import assert from 'node:assert/strict'
import { test } from 'node:test'
import { quoteOrder } from '../src/online-orders.mjs'

test('quotes each pumpkin and the total', () => {
  const quote = quoteOrder([
    { variety: 'carving', kg: 4.5 },
    { variety: 'crown', kg: 2.5 },
  ])
  assert.deepEqual(
    quote.lines.map((line) => line.pence),
    [540, 450],
  )
  assert.equal(quote.totalPence, 990)
})

test('a small pumpkin still costs the minimum', () => {
  assert.equal(quoteOrder([{ variety: 'munchkin', kg: 0.4 }]).totalPence, 200)
})

test('refuses a variety the shop does not sell', () => {
  assert.throws(() => quoteOrder([{ variety: 'turban', kg: 1 }]), /We don't sell turban pumpkins/)
})
