import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { cartQuote } from '../src/cart.mjs'
import { quoteCsv } from '../src/import.mjs'
import { labelLine } from '../src/labels.mjs'
import { quote } from '../src/rates.mjs'

test('quotes by billable weight', () => {
  assert.equal(quote(1.2, 20, 15, 10, 'A', false), 495 + 180)
  assert.equal(quote(0.4, 60, 40, 40, 'B', true), Math.round((695 + 19.5 * 180) * 1.5))
})

test('rejects unknown zones', () => {
  assert.throws(() => quote(1, 10, 10, 10, 'Z', false), RangeError)
})

test('cart quote', () => {
  const cart = { items: [{ weightKg: 0.5, qty: 3 }], zone: 'B', shipping: 'standard' }
  assert.equal(cartQuote(cart), 695 + 360)
})

test('label line', () => {
  assert.equal(
    labelLine({ kg: 2.2, l: 20, w: 20, h: 20, zone: 'B', express: true }),
    'ZONE B · 2.5 kg · EXPRESS · $17.18',
  )
})

test('carrier CSV', () => {
  const csv = readFileSync(new URL('../data/carrier-export.csv', import.meta.url), 'utf8')
  assert.deepEqual(quoteCsv(csv), [675, 6308, 2815])
})
