import assert from 'node:assert/strict'
import { test } from 'node:test'
import { problemWith } from '../src/bookings.mjs'
import { loadMembers } from '../src/members.mjs'

const members = loadMembers(
  'code,name,expires\r\nM1001,Priya Shah,2027-03-31\r\nM1003,Ana Lima,2026-09-30\r\n',
)

test('a member with a valid code can book a free court', () => {
  assert.equal(
    problemWith({ member: 'M1001', court: 1, date: '2026-11-07', hour: 9 }, members),
    null,
  )
})

test('a malformed code is refused', () => {
  assert.equal(
    problemWith({ member: 'M12', court: 1, date: '2026-11-07', hour: 9 }, members),
    'unknown member',
  )
})

test('an expired membership is refused', () => {
  assert.equal(
    problemWith({ member: 'M1003', court: 1, date: '2026-11-07', hour: 9 }, members),
    'membership expired',
  )
})
