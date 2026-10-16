import assert from 'node:assert/strict'
import { test } from 'node:test'
import { invoiceLine, invoiceTotal } from '../src/invoice.mjs'
import { receipt } from '../src/receipt.mjs'

test('formats an invoice line', () => {
  assert.equal(
    invoiceLine({ description: 'Widget', quantity: 3, unitCents: 1250 }),
    'Widget x3 @ $12.50 = $37.50',
  )
})

test('totals lines', () => {
  assert.equal(invoiceTotal([{ quantity: 2, unitCents: 500 }]), 'Total: $10.00')
})

test('lists receipt payments', () => {
  assert.equal(receipt([{ method: 'card', amount: 12.5 }]), 'card: $12.50')
})
