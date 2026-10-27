import assert from 'node:assert/strict'
import { test } from 'node:test'
import { amountOf, pounds, summary } from '../src/takings.mjs'

const slip = (fields) => ({ date: '2026-10-01', till: 'front', kind: 'sale', amount: 1, ...fields })

test('an amount typed in as text still counts', () => {
  assert.equal(amountOf(slip({ amount: '4.50' })), 4.5)
})

test('the summary splits tills and kinds and nets refunds off', () => {
  const s = summary([
    slip({ amount: 12.5 }),
    slip({ till: 'back', amount: 3 }),
    slip({ kind: 'refund', amount: -2.25 }),
  ])
  assert.equal(s.slips, 3)
  assert.equal(pounds(s.front), '£10.25')
  assert.equal(pounds(s.back), '£3.00')
  assert.equal(pounds(s.sales), '£15.50')
  assert.equal(pounds(s.refunds), '£-2.25')
  assert.equal(pounds(s.net), '£13.25')
})
