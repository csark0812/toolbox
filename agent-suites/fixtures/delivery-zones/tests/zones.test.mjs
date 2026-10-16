import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { assignAll, zoneFor } from '../src/zones.mjs'

const zones = JSON.parse(readFileSync(new URL('../data/zones.json', import.meta.url), 'utf8'))

test('an address inside one zone', () => {
  assert.equal(zoneFor(zones, [100, 100]), 'Old Town')
  assert.equal(zoneFor(zones, [1000, 400]), 'Hill Estate')
})

test('the first zone wins where zones overlap', () => {
  assert.equal(zoneFor(zones, [350, 250]), 'Old Town')
})

test('outside every zone', () => {
  assert.equal(zoneFor(zones, [2000, 2000]), null)
})

test('edges follow the ray cast', () => {
  assert.equal(zoneFor(zones, [0, 100]), 'Old Town')
  assert.equal(zoneFor(zones, [400, 100]), null)
  assert.equal(zoneFor(zones, [100, 0]), 'Old Town')
  assert.equal(zoneFor(zones, [100, 300]), null)
})

test('assigns every address', () => {
  assert.deepEqual(
    assignAll(zones, [
      { id: 'a', at: [100, 100] },
      { id: 'b', at: [5000, 0] },
    ]),
    [
      { id: 'a', zone: 'Old Town' },
      { id: 'b', zone: null },
    ],
  )
})
