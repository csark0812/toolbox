import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createFeedCache } from '../src/cache.mjs'

test('serves the cached feed between refreshes', async () => {
  let clock = 0
  let fetches = 0
  const cache = createFeedCache(async () => [{ title: `v${++fetches}`, publishedAt: 0 }], {
    now: () => clock,
  })
  await cache.items()
  clock = 60_000
  await cache.items()
  assert.equal(fetches, 1)
})
