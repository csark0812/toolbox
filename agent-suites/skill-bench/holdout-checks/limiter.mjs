// Hidden acceptance for the limiter feature: token bucket per key, refill over time, isolated keys.
import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { createLimiter } = await import(pathToFileURL(join(dir, 'src/limiter.mjs')).href)
const limiter = createLimiter({ capacity: 3, refillPerSecond: 1 })
assert.deepEqual(
  [0, 0, 0, 0].map(() => limiter.allow('a', 0)),
  [true, true, true, false],
  'capacity 3 at t=0',
)
assert.equal(limiter.allow('b', 0), true, 'keys are independent')
assert.equal(limiter.allow('a', 999), false, 'no token before one second')
assert.equal(limiter.allow('a', 1000), true, 'one token after one second')
assert.equal(limiter.allow('a', 1000), false)
assert.deepEqual(
  [0, 0, 0, 0].map(() => limiter.allow('a', 60000)),
  [true, true, true, false],
  'refill caps at capacity',
)
const tests = readdirSync(join(dir, 'tests')).filter((name) => name !== 'headers.test.mjs')
assert.ok(tests.length > 0, 'the feature ships with its own tests')
