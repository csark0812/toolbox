import assert from 'node:assert/strict'
import { test } from 'node:test'
import { lotLine } from '../src/lots.mjs'

test('formats a lot line', () => {
  assert.equal(
    lotLine({ lot: 7, title: 'Penny Red block', topBid: '£12', closes: '14:30' }),
    'Lot 7: Penny Red block (top bid £12, closes 14:30)',
  )
})
