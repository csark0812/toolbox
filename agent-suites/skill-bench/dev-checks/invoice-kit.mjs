// Development check for the money-helper consolidation: one helper left, every output unchanged.
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const load = (file) => import(pathToFileURL(join(dir, file)).href)
const { invoiceLine, invoiceTotal } = await load('src/invoice.mjs')
const { receipt, refundLine } = await load('src/receipt.mjs')

// The original helpers, kept here to pin outputs.
const formatMoney = (cents, currency = 'USD') => {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  return `${sign}${currency === 'EUR' ? '€' : '$'}${Math.floor(abs / 100).toLocaleString('en-US')}.${String(abs % 100).padStart(2, '0')}`
}
const toCurrency = (amount, symbol = '$') => {
  const value = (Math.round(amount * 100) / 100).toFixed(2)
  return amount < 0 ? `(${symbol}${value.slice(1)})` : `${symbol}${value}`
}
for (const unitCents of [0, 1, 99, 100, 1250, 99999, 123456789, -500])
  for (const quantity of [1, 3, 1000])
    for (const currency of [undefined, 'USD', 'EUR']) {
      const line = { description: 'Item', quantity, unitCents, currency }
      assert.equal(
        invoiceLine(line),
        `Item x${quantity} @ ${formatMoney(unitCents, currency)} = ${formatMoney(quantity * unitCents, currency)}`,
      )
      assert.equal(
        invoiceTotal([line], currency),
        `Total: ${formatMoney(quantity * unitCents, currency)}`,
      )
    }
for (const amount of [0, 0.005, 0.1, 1.005, 12.5, 1234.567, 1000000])
  assert.equal(receipt([{ method: 'card', amount }]), `card: ${toCurrency(amount)}`)
for (const amount of [0.5, 12.34, 1000])
  assert.equal(refundLine(amount), `Refund ${toCurrency(-amount)}`)
const legacy = join(dir, 'src/legacy/currency.mjs')
assert.ok(!existsSync(legacy), 'the legacy helper is removed')
assert.ok(
  !readFileSync(join(dir, 'src/receipt.mjs'), 'utf8').includes('legacy'),
  'receipts use the shared helper',
)
