import assert from 'node:assert/strict'
import { test } from 'node:test'
import { nextDelay, retryAfterMs } from '../src/backoff.mjs'
import { deliver } from '../src/deliver.mjs'

const fakeClock = () => {
  let clock = 0
  return { now: () => clock, sleep: async (ms) => void (clock += ms) }
}
const replies = (...statuses) => {
  let i = 0
  return async () => ({ status: statuses[Math.min(i++, statuses.length - 1)] })
}
const config = { retries: 3, baseDelayMs: 1000, deadlineMs: 60000 }

test('backs off exponentially, honoring Retry-After', () => {
  assert.deepEqual(
    [1, 2, 3].map((n) => nextDelay(n, 1000)),
    [1000, 2000, 4000],
  )
  assert.equal(nextDelay(1, 1000, 30000), 30000)
  assert.equal(retryAfterMs({ 'retry-after': '12' }), 12000)
})

test('retries server errors until delivered', async () => {
  const result = await deliver({}, replies(500, 502, 200), config, fakeClock())
  assert.equal(result.delivered, true)
  assert.equal(result.attempts, 3)
})

test('does not retry a rejected event', async () => {
  const result = await deliver({}, replies(400), config, fakeClock())
  assert.deepEqual([result.delivered, result.attempts, result.reason], [false, 1, 'rejected'])
})
