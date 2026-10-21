import assert from 'node:assert/strict'
import { test } from 'node:test'
import { reorderSheet, totals } from '../src/stock.mjs'

const row = (sku, location, copies) => ({ sku, artist: 'A', title: 'T', location, copies })

test('copies are counted across the shop and the warehouse', () => {
  assert.equal(totals([row('X', 'shop', 1), row('X', 'warehouse', 3)])[0].copies, 4)
})

test('a record with one copy left is low', () => {
  assert.deepEqual(
    reorderSheet([row('X', 'shop', 1)]).low.map((record) => record.sku),
    ['X'],
  )
})

test('a record with none anywhere is sold out, not low', () => {
  const sheet = reorderSheet([row('X', 'shop', 0), row('X', 'warehouse', 0)])
  assert.equal(sheet.soldOut.length, 1)
  assert.equal(sheet.low.length, 0)
})
