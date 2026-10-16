import assert from 'node:assert/strict'
import { test } from 'node:test'
import { pounds, receiptLines } from '../src/receipt.mjs'

const sale = {
  shop: 'Shop',
  number: 7,
  date: '2026-10-16',
  items: [{ name: 'Leeks', qty: 3, unitPence: 60 }],
  footer: 'Thanks',
}

test('formats pence', () => {
  assert.equal(pounds(1250), '£12.50')
})

test('a short receipt', () => {
  assert.deepEqual(receiptLines(sale), [
    '              Shop',
    'Sale 7                2026-10-16',
    '-'.repeat(32),
    '3 x Leeks                  £1.80',
    '-'.repeat(32),
    'TOTAL                      £1.80',
    'Thanks',
  ])
})
