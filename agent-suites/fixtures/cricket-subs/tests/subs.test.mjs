import assert from 'node:assert/strict'
import { test } from 'node:test'
import { householdBills, memberSub } from '../src/subs.mjs'

test('a full season costs the full sub', () => {
  assert.equal(memberSub({ junior: false, joined: '' }), 12000)
  assert.equal(memberSub({ junior: true, joined: '' }), 6000)
})

test('joining late pays for the months left, counting the month joined', () => {
  assert.equal(memberSub({ junior: false, joined: '2026-06' }), 8000)
  assert.equal(memberSub({ junior: true, joined: '2026-09' }), 1000)
})

test('a household pays the sum of its subs', () => {
  const members = [
    { name: 'A Bell', household: 4, junior: false, joined: '' },
    { name: 'B Bell', household: 4, junior: true, joined: '' },
  ]
  assert.deepEqual(householdBills(members, []), [
    { household: '4', surname: 'Bell', members: 2, pence: 18000, capped: false },
  ])
})
