import assert from 'node:assert/strict'
import { test } from 'node:test'
import { roadKm } from '../src/distance.mjs'
import { dollars, fare } from '../src/fares.mjs'

test('prices a trip', () => {
  assert.equal(fare({ km: 5, minutes: 12 }), 1210)
  assert.equal(fare({ km: 2.5, minutes: 7 }), 760)
})

test('formats dollars', () => {
  assert.equal(dollars(1210), '$12.10')
})

test('approximates road distance', () => {
  assert.equal(roadKm({ lat: 40.7128, lon: -74.006 }, { lat: 40.7306, lon: -73.9866 }), 3.3)
})
