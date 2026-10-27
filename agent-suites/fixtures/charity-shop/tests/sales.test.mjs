import assert from 'node:assert/strict'
import { test } from 'node:test'
import { donated, pounds, takings } from '../src/sales.mjs'

const sales = [
  { item: 'Coat', kind: 'donated', donor: 'D-1', pence: 2400, soldOn: '2026-10-12' },
  { item: 'Cards', kind: 'new', donor: null, pence: 450, soldOn: '2026-10-12' },
]

test('donated goods leave out the new stock', () => {
  assert.deepEqual(
    donated(sales).map((sale) => sale.item),
    ['Coat'],
  )
})

test('takings add up in pence and print as pounds', () => {
  assert.equal(takings(sales), 2850)
  assert.equal(pounds(2850), '£28.50')
})
