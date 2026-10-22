import assert from 'node:assert/strict'
import { test } from 'node:test'
import { handleBook, handleList } from '../src/api.mjs'
import { openStore } from '../src/store.mjs'

test('members list only their own bookings', () => {
  const result = handleList({}, { memberId: 'm-1' }, openStore())
  assert.deepEqual(
    result.body.map((entry) => entry.id),
    ['b1', 'b4'],
  )
})

test('a new booking starts unpaid', () => {
  const store = openStore()
  const session = { memberId: 'm-2', name: 'Tariq Shah', phone: '07700 900222' }
  const result = handleBook({ body: { courseId: 'c2' } }, session, store)
  assert.equal(result.status, 201)
  assert.equal(result.body.status, 'unpaid')
})
