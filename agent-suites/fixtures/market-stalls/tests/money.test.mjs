import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cell, COLUMNS } from '../src/columns.mjs'
import { invoiceLines } from '../src/invoice.mjs'
import { formatPrice } from '../src/money.mjs'

test('pounds with the symbol by default', () => {
  assert.equal(formatPrice(1250), '£12.50')
})

test('code instead of symbol', () => {
  assert.equal(formatPrice(1250, 'GBP', false), '12.50 GBP')
})

test('euros in whole units', () => {
  assert.equal(formatPrice(1250, 'EUR', true, 0), '€13')
})

test('an unknown currency is refused', () => {
  assert.throws(() => formatPrice(100, 'USD'), RangeError)
})

test('an invoice ends with its total', () => {
  const lines = invoiceLines({ pitch: 'Z9', trader: 'T', fees: [{ item: 'Pitch', pence: 3200 }] })
  assert.equal(lines.at(-1), '  Total                     £32.00')
})

test('the export total has no symbol', () => {
  const total = COLUMNS.find((column) => column.header === 'total')
  assert.equal(cell(total, { fees: [{ pence: 3850 }] }), '38.50 GBP')
})
