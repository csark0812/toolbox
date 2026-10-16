import assert from 'node:assert/strict'
import { test } from 'node:test'
import { assign } from '../src/dispatch.mjs'
import { formatAddress, haversineKm, shortAddress, travelMinutes } from '../src/geo.mjs'

const address = {
  line1: '2 Quay Street',
  line2: '',
  town: 'Galway',
  county: 'Galway',
  eircode: 'H91 C5D6',
}

test('measures distance', () => {
  assert.equal(haversineKm({ lat: 53.3498, lon: -6.2603 }, { lat: 51.8985, lon: -8.4756 }), 220)
})

test('estimates travel time', () => {
  assert.equal(travelMinutes(0), 10)
  assert.equal(travelMinutes(12.3), 25)
})

test('formats addresses', () => {
  assert.equal(formatAddress(address), '2 Quay Street\nGalway\nCo. Galway\nH91 C5D6')
  assert.equal(shortAddress(address), '2 Quay Street, Galway H91 C5D6')
})

test('assigns the nearest free technician', () => {
  const techs = [
    { id: 'a', base: { lat: 0, lon: 0 } },
    { id: 'b', base: { lat: 1, lon: 1 } },
  ]
  const jobs = assign(
    [
      { id: 'x', location: { lat: 0.1, lon: 0.1 } },
      { id: 'y', location: { lat: 0, lon: 0 } },
      { id: 'z', location: { lat: 0, lon: 0 } },
    ],
    techs,
  )
  assert.deepEqual(
    jobs.map((job) => job.tech?.id ?? null),
    ['a', 'b', null],
  )
})
