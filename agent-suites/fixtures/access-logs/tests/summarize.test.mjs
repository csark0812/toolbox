import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseLine, routeOf, summarize } from '../src/summarize.mjs'

test('parses a line', () => {
  assert.deepEqual(parseLine('2026-10-01T12:00:00.123Z GET /users/12?tab=posts 200 34ms'), {
    at: '2026-10-01T12:00:00.123Z',
    method: 'GET',
    path: '/users/12?tab=posts',
    status: 200,
    ms: 34,
  })
  assert.equal(parseLine('garbage'), null)
})

test('matches routes, first match wins', () => {
  assert.equal(routeOf('/users/12?tab=posts'), '/users/:id')
  assert.equal(routeOf('/users/12/posts'), '/users/:id/posts')
  assert.equal(routeOf('/admin/users/3'), '/admin/*')
  assert.equal(routeOf('/nope'), 'other')
})

test('summarizes per route with nearest-rank percentiles', () => {
  const lines = [
    't GET /users/1 200 10ms',
    't GET /users/2 200 30ms',
    't GET /users/3 503 20ms',
    't GET /users/4 200 40ms',
    't POST /login 200 99ms',
    'broken',
  ]
  assert.deepEqual(summarize(lines), {
    routes: [
      { route: 'GET /users/:id', count: 4, errors: 1, p50: 20, p95: 40 },
      { route: 'POST /login', count: 1, errors: 0, p50: 99, p95: 99 },
    ],
    malformed: 1,
  })
})
