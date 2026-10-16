import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hoursIn, occupied } from '../src/lockers.mjs'

const parcel = (locker, deliveredAt, collectedAt = null) => ({
  id: locker,
  locker,
  site: 'x',
  recipient: 'y',
  deliveredAt,
  collectedAt,
})

test('a parcel is in its locker from delivery until collection', () => {
  const parcels = [
    parcel('B1', '2026-10-12T09:00:00Z'),
    parcel('A1', '2026-10-12T09:00:00Z', '2026-10-12T12:00:00Z'),
    parcel('C1', '2026-10-13T09:00:00Z'),
  ]
  assert.deepEqual(
    occupied(parcels, '2026-10-12T10:00:00Z').map((p) => p.locker),
    ['A1', 'B1'],
  )
  assert.deepEqual(
    occupied(parcels, '2026-10-12T12:00:00Z').map((p) => p.locker),
    ['B1'],
  )
})

test('whole hours in the locker', () => {
  assert.equal(hoursIn(parcel('A1', '2026-10-12T09:00:00Z'), '2026-10-13T08:59:00Z'), 23)
})
