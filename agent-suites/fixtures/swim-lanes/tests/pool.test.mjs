import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createPool } from '../src/pool.mjs'

const day = '2026-10-17'

test('every slot starts free', () => {
  const pool = createPool()
  assert.deepEqual(pool.free(day)[0], { lane: 1, hours: [6, 7, 8] })
})

test('a booked slot is no longer free', () => {
  const pool = createPool()
  assert.deepEqual(pool.book({ id: 'a', club: 'Seals', lane: 1, day, hour: 6 }), { ok: true })
  assert.deepEqual(pool.free(day)[0], { lane: 1, hours: [7, 8] })
})

test('a lane takes one club per slot', () => {
  const pool = createPool()
  pool.book({ id: 'a', club: 'Seals', lane: 1, day, hour: 6 })
  assert.deepEqual(pool.book({ id: 'b', club: 'Otters', lane: 1, day, hour: 6 }), {
    ok: false,
    reason: 'taken',
  })
})

test('cancelling an unknown booking is reported', () => {
  assert.equal(createPool().cancel('nope'), false)
})
