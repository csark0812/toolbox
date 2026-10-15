import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createCache } from '../src/cache.mjs'
test('expires after ttl', () => {
  let t = 0
  const cache = createCache({ ttlMs: 100, now: () => t })
  cache.set('a', 5)
  t = 99
  assert.equal(cache.get('a'), 5)
  t = 100
  assert.equal(cache.get('a'), undefined)
})
