import assert from 'node:assert/strict'
import { test } from 'node:test'
import { assign, nextDue } from '../src/queue.mjs'
import { clock, minutes } from '../src/times.mjs'

test('dock times convert both ways', () => {
  assert.equal(minutes('9:05'), 545)
  assert.equal(clock(545), '9:05')
})

test('the first in the queue gets the first canoe back', () => {
  const returns = [
    { canoe: 'A', back: '11:30' },
    { canoe: 'B', back: '10:15' },
  ]
  const rows = assign(returns, [{ name: 'Kim', arrived: '10:00' }])
  assert.equal(rows[0].canoe, 'B')
  assert.equal(rows[0].wait, 15)
  assert.equal(nextDue(returns).canoe, 'B')
})
