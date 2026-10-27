import assert from 'node:assert/strict'
import { test } from 'node:test'
import { basePrice } from '../src/prices.mjs'

test('matinees start before 17:00', () => {
  assert.equal(basePrice({ time: '16:45' }), 750)
  assert.equal(basePrice({ time: '17:00' }), 1000)
})
