import assert from 'node:assert/strict'
import { test } from 'node:test'
import { boardLine } from '../src/menu.mjs'

test('the board shows the price and allergens', () => {
  const wrap = { name: 'Halloumi wrap', pence: 750, kind: 'main', allergens: ['milk', 'gluten'] }
  assert.equal(boardLine(wrap), 'Halloumi wrap  £7.50  (milk, gluten)')
})

test('an item with no allergens shows none', () => {
  const chips = { name: 'Chips', pence: 300, kind: 'side', allergens: [] }
  assert.equal(boardLine(chips), 'Chips          £3.00')
})
