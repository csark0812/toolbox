import assert from 'node:assert/strict'
import { test } from 'node:test'
import { byDesign, loadStock } from '../src/stock.mjs'

test('rows are grouped by design in first-seen order', () => {
  const designs = byDesign(loadStock())
  assert.deepEqual([...designs.keys()], ['Lighthouse', 'Kraken', 'Puffin', 'Gull'])
  assert.equal(designs.get('Lighthouse').length, 5)
})
