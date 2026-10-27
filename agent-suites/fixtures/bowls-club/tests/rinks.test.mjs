import assert from 'node:assert/strict'
import { test } from 'node:test'
import { allocate } from '../src/rinks.mjs'

const request = (team, rink, session = 'morning') => ({ team, rink, date: '2026-11-14', session })

test('a free rink is given to the first team that asks', () => {
  assert.deepEqual(
    allocate([request('Harriers', 1)]).map((result) => result.problem),
    [null],
  )
})

test('a rink already given out in that session is turned down', () => {
  assert.deepEqual(
    allocate([request('Harriers', 1), request('Swifts', 1)]).map((result) => result.problem),
    [null, 'rink taken'],
  )
})

test('rink 0 does not exist', () => {
  assert.equal(allocate([request('Harriers', 0)])[0].problem, 'no such rink')
})
