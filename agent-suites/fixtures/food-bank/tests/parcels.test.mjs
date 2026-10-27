import assert from 'node:assert/strict'
import { test } from 'node:test'
import { packingList, parcelSize, weekCounts } from '../src/parcels.mjs'

test('parcel sizes follow the household size', () => {
  assert.equal(parcelSize(1), 'small')
  assert.equal(parcelSize(2), 'small')
  assert.equal(parcelSize(4), 'medium')
  assert.equal(parcelSize(6), 'large')
})

test('cancelled referrals are not packed', () => {
  const referrals = [
    { ref: 'A', surname: 'A', people: 2, day: 'Tue', status: 'active' },
    { ref: 'B', surname: 'B', people: 2, day: 'Tue', status: 'cancelled' },
  ]
  assert.equal(packingList(referrals, 'Tue').length, 1)
  assert.deepEqual(weekCounts(referrals), { small: 1, medium: 0, large: 0 })
})
