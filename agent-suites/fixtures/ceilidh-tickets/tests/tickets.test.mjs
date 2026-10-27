import assert from 'node:assert/strict'
import { test } from 'node:test'
import { doorSpaces, parseCsv, ticketsSold } from '../src/tickets.mjs'

const sales = parseCsv(`order,source,type,qty,status,refunded
W-1,online,adult,2,paid,0
W-2,online,child,1,paid,0
W-3,online,adult,3,refunded,3
P-1,shop,adult,4,paid,0
P-2,shop,adult,-1,refund,0`)

test('refunded orders are taken off', () => {
  assert.equal(ticketsSold(sales), 6)
})

test('the door gets whatever is left under the hall limit', () => {
  assert.equal(doorSpaces(sales), 144)
})
