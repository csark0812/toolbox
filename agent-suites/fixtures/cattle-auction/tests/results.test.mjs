import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buyerTotals, saleResults } from '../src/results.mjs'

const bidders = [
  { paddle: 'P1', name: 'Ann' },
  { paddle: 'P2', name: 'Bob' },
]
const lot = { lot: '1', description: 'steers', reserve: 1000, hammer: '10:00:00' }
const bid = (paddle, amount, at) => ({ lot: '1', paddle, amount, at })

test('the highest bid at or before the hammer wins', () => {
  const [result] = saleResults({
    lots: [lot],
    bids: [bid('P1', 1100, '09:59:00'), bid('P2', 1200, '10:00:00'), bid('P1', 1300, '10:00:01')],
    bidders,
    retractions: [],
  })
  assert.deepEqual(result, { lot: '1', sold: true, price: 1200, buyer: 'P2', premium: 30 })
})

test('a withdrawn bid does not count', () => {
  const [result] = saleResults({
    lots: [lot],
    bids: [bid('P1', 1100, '09:59:00'), bid('P2', 1200, '09:59:10')],
    bidders,
    retractions: [{ lot: '1', paddle: 'P2', at: '09:59:30' }],
  })
  assert.equal(result.buyer, 'P1')
})

test('a lot below its reserve is not sold', () => {
  const results = saleResults({
    lots: [lot],
    bids: [bid('p1', 900, '09:59:00')],
    bidders,
    retractions: [],
  })
  assert.deepEqual(results, [{ lot: '1', sold: false, price: 900, buyer: null, premium: 0 }])
  assert.deepEqual(buyerTotals(results, bidders), [])
})
