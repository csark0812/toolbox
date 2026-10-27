import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { route } from '../src/api.mjs'
import { reset } from '../src/store.mjs'

beforeEach(reset)
const maya = { learnerId: 'l-1' }

test('a learner lists only their own lessons, soonest first', () => {
  const response = route('GET', '/lessons', {}, maya)
  assert.equal(response.status, 200)
  assert.deepEqual(
    response.body.map((lesson) => lesson.id),
    ['ls-101', 'ls-103'],
  )
})

test('lessons need a session', () => {
  assert.equal(route('GET', '/lessons', {}, null).status, 401)
})

test('an instructor cannot be double-booked', () => {
  const body = { instructorId: 'i-1', start: '2026-10-28T11:00', minutes: 60 }
  assert.equal(route('POST', '/lessons', { body }, maya).status, 409)
})

test('a free slot can be booked', () => {
  const body = { instructorId: 'i-1', start: '2026-10-28T15:00', minutes: 60 }
  const response = route('POST', '/lessons', { body }, maya)
  assert.equal(response.status, 201)
  assert.equal(response.body.learnerId, 'l-1')
})
