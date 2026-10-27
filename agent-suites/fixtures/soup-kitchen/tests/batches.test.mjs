import assert from 'node:assert/strict'
import { test } from 'node:test'
import { batchLine } from '../src/batches.mjs'

const batch = {
  id: 'S41',
  date: '2026-11-03',
  soup: 'Leek and Potato',
  status: 'served',
  pots: ['20l', '18.5 l', '5 pints'],
}

test('a batch shows its id, date, soup and pots', () => {
  assert.equal(batchLine(batch), 'S41  2026-11-03  Leek and Potato       20l, 18.5 l, 5 pints')
})

test('a burnt batch says so', () => {
  assert.match(batchLine({ ...batch, status: 'burnt' }), /Leek and Potato {7}\(burnt\) 20l/)
})
