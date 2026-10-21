import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  councilFor,
  expiringPermits,
  needsPermit,
  permitEnd,
  permitFee,
  quoteTotal,
} from '../src/hire.mjs'

const road = {
  ref: 'T-1',
  postcode: 'BS3 4RT',
  size: 'midi',
  weeks: 2,
  placement: 'road',
  start: '2026-10-12',
}

test('finds the council from the postcode district', () => {
  assert.equal(councilFor('bs16 3qq'), 'South Gloucestershire')
  assert.equal(councilFor('GL1 2AA'), null)
})

test('only a skip on the road needs a permit', () => {
  assert.equal(needsPermit(road), true)
  assert.equal(needsPermit({ ...road, placement: 'driveway' }), false)
  assert.equal(permitFee({ ...road, placement: 'driveway' }), 0)
})

test('a quote adds hire, delivery and the permit', () => {
  assert.equal(quoteTotal(road), 29000 + 0 + 4500)
  assert.equal(quoteTotal({ ...road, postcode: 'BS21 6HU' }), 29000 + 2500 + 5200)
})

test('a permit stops at the council limit', () => {
  assert.equal(permitEnd({ ...road, weeks: 4 }), '2026-10-26')
  assert.deepEqual(
    expiringPermits([road], '2026-10-25').map(({ ends }) => ends),
    ['2026-10-26'],
  )
})
