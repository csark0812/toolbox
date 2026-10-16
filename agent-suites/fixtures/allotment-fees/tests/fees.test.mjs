import assert from 'node:assert/strict'
import { test } from 'node:test'
import { annualFee, invoiceRun, pounds } from '../src/fees.mjs'

test('standard rent plus water', () => {
  assert.equal(annualFee({ plot: 1, area: 125 }), 5800)
})

test('the invoice run totals every plot', () => {
  assert.equal(invoiceRun([{ plot: 5, holder: 'x', area: 100 }]).total, 5000)
})

test('formats pence as pounds', () => {
  assert.equal(pounds(49840), '£498.40')
})

test('an unknown concession is refused', () => {
  assert.throws(() => annualFee({ plot: 4, area: 10, concession: 'vip' }), RangeError)
})

test('students pay three quarters of the rent', () => {
  assert.equal(annualFee({ plot: 3, area: 60, concession: 'student' }), 3240)
})

test('pensioners pay half the rent but full water', () => {
  assert.equal(annualFee({ plot: 2, area: 125, concession: 'pensioner' }), 3800)
})
