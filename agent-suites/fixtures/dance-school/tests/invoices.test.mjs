import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { generateTermInvoices } from '../src/invoices.mjs'
import { invoices, reset } from '../src/store.mjs'

beforeEach(reset)

test('every family gets one invoice for the term', () => {
  const created = generateTermInvoices('2027-summer')
  assert.deepEqual(created.map((invoice) => invoice.familyId).sort(), ['f-1', 'f-2', 'f-3'])
})

test('an invoice is due two weeks before the term starts', () => {
  const [first] = generateTermInvoices('2027-summer')
  assert.equal(first.dueOn, '2027-04-05')
})

test('earlier invoices are kept', () => {
  generateTermInvoices('2027-summer')
  assert.equal(invoices().length, 7)
})

test('a term is only invoiced once', () => {
  assert.throws(() => generateTermInvoices('2027-spring'), /already been invoiced/)
})
