import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cancelBooking } from '../src/api.mjs'

const tom = { id: 'u2', name: 'Tom Fenn', role: 'staff' }
const priya = { id: 'u1', name: 'Priya Nair', role: 'admin' }

test('staff cancel their own bookings', () => {
  assert.equal(cancelBooking({ params: { id: 'b1' } }, tom).status, 200)
})

test("staff cannot cancel someone else's booking", () => {
  assert.equal(cancelBooking({ params: { id: 'b2' } }, tom).status, 403)
})

test('admins cancel any booking', () => {
  assert.equal(cancelBooking({ params: { id: 'b2' } }, priya).status, 200)
})
