import assert from 'node:assert/strict'
import { test } from 'node:test'
import { detourMinutes, distanceToRoute } from '../src/geo.mjs'

test('distance to the nearest point of a route', () => {
  assert.equal(
    distanceToRoute(
      [2, 3],
      [
        [0, 0],
        [4, 0],
      ],
    ),
    3,
  )
  assert.equal(
    distanceToRoute(
      [6, 0],
      [
        [0, 0],
        [4, 0],
      ],
    ),
    2,
  )
})

test('a detour is there and back at 30 km/h', () => {
  assert.equal(detourMinutes(1), 4)
})
