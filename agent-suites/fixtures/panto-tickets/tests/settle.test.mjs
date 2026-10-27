import assert from 'node:assert/strict'
import { test } from 'node:test'
import { netOf, parseCsv, payoutDue } from '../src/settle.mjs'

const csv = `id,performance,channel,band,status
X1,12-12-eve,online,adult,sold
X2,12-12-eve,online,child,sold
X3,12-12-eve,door,adult,sold
X4,12-12-eve,online,adult,refunded`

test('the platform keeps 8% of each ticket', () => {
  assert.equal(netOf('adult'), 1472)
  assert.equal(netOf('child'), 920)
})

test('door sales and refunds are not due from the platform', () => {
  assert.equal(payoutDue(parseCsv(csv), '12-12-eve'), 1472 + 920)
})
