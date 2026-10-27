import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { route } from '../src/api.mjs'
import { reset } from '../src/store.mjs'

beforeEach(reset)
const priya = { guestId: 'g-1' }
const ruth = { guestId: 'g-3' }

test('a guest sees only their own bookings', () => {
  const response = route('GET', '/bookings', {}, priya)
  assert.equal(response.status, 200)
  assert.deepEqual(
    response.body.map((entry) => entry.id),
    ['bk-1'],
  )
})

test('a free pitch can be booked and the deposit is a fifth of the total', () => {
  const body = { arrive: '2027-05-20', depart: '2027-05-23' }
  const response = route('POST', '/pitches/p-3/bookings', { body }, ruth)
  assert.equal(response.status, 201)
  assert.equal(response.body.totalPence, 7200)
  assert.equal(response.body.depositPence, 1440)
})

test('a booked night cannot be booked again', () => {
  const body = { arrive: '2027-05-29', depart: '2027-06-01' }
  assert.equal(route('POST', '/pitches/p-2/bookings', { body }, ruth).status, 409)
})

test('a pitch is free again on the day the last guests leave', () => {
  const body = { arrive: '2027-05-31', depart: '2027-06-02' }
  assert.equal(route('POST', '/pitches/p-2/bookings', { body }, ruth).status, 201)
})

test('signing in is required', () => {
  assert.equal(route('GET', '/bookings', {}, null).status, 401)
})
