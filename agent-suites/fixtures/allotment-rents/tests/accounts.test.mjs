import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { rentAccounts } from '../src/accounts.mjs'

const data = JSON.parse(readFileSync(new URL('../data/rents.json', import.meta.url), 'utf8'))
const account = (tenant) => rentAccounts(data).accounts.find((entry) => entry.tenant === tenant)

test('the incoming tenant is billed on a handover day', () => {
  assert.deepEqual(account('Sam Okafor'), {
    tenant: 'Sam Okafor',
    invoiced: 8600,
    paid: 2800,
    owed: 5800,
    credit: 0,
    unpaid: ['INV-2026-9'],
  })
})

test('a payment pays the oldest invoices across all the tenant’s plots', () => {
  assert.equal(account('Joan Pryce').owed, 0)
})

test('credit pays the next invoice', () => {
  assert.equal(account('Ravi Mehta').credit, 2400)
})

test('payments without a plot are unmatched', () => {
  assert.deepEqual(
    rentAccounts(data).unmatched.map((payment) => payment.reference),
    ['ALLOTMENT RENT'],
  )
})
