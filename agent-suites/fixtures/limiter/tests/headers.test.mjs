import assert from 'node:assert/strict'
import { test } from 'node:test'
import { rateLimitHeaders } from '../src/headers.mjs'
test('never reports negative remaining', () => {
  assert.deepEqual(rateLimitHeaders(10, -1), {
    'X-RateLimit-Limit': '10',
    'X-RateLimit-Remaining': '0',
  })
})
