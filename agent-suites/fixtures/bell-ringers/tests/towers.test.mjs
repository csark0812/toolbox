import assert from 'node:assert/strict'
import { test } from 'node:test'
import { describe, ringable, sortTowers, tenorPounds } from '../src/towers.mjs'

const towers = [
  { name: 'St Mary', bells: 8, tenor: '24-1-12', practice: 'Tue' },
  { name: 'St John', tenor: '7-3-20', practice: 'Mon' },
  { name: 'All Saints', bells: 10, tenor: '31-2-0', practice: 'Wed' },
]

test('tenor weights are converted to pounds', () => {
  assert.equal(tenorPounds('24-1-12'), 2728)
})

test('an unsurveyed tower is a ring of 6', () => {
  assert.match(describe(towers[1]), / 6 bells/)
  assert.equal(ringable(towers[1], 6), true)
})

test('sorting by bells puts the biggest rings first', () => {
  assert.deepEqual(
    sortTowers(towers, 'bells').map((tower) => tower.name),
    ['All Saints', 'St Mary', 'St John'],
  )
})

test('a band needs a ringer for every bell', () => {
  assert.equal(ringable(towers[0], 7), false)
  assert.equal(ringable(towers[0], 8), true)
})
