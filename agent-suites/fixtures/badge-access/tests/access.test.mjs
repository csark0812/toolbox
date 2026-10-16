import assert from 'node:assert/strict'
import { test } from 'node:test'
import { canOpen, checkDoor } from '../src/access.mjs'
import { entries } from '../src/audit.mjs'

const staff = { id: 'B1', kind: 'staff', zones: ['office', 'lab'] }
const door = (zone) => ({ id: `D-${zone}`, zone })

test('opens doors in the badge zones only', () => {
  assert.equal(canOpen(staff, door('lab')), true)
  assert.equal(canOpen(staff, door('lab-secure')), false)
  assert.equal(canOpen(staff, door('server-room')), false)
})

test('a revoked badge opens nothing', () => {
  assert.equal(canOpen({ ...staff, revoked: true }, door('office')), false)
})

test('every swipe is audited', () => {
  const before = entries.length
  checkDoor(staff, door('office'))
  checkDoor(staff, door('server-room'))
  assert.deepEqual(
    entries.slice(before).map((entry) => entry.result),
    ['granted', 'denied'],
  )
})
