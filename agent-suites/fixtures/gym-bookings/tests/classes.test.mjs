import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { route } from '../src/api.mjs'
import { reset } from '../src/store.mjs'

beforeEach(reset)
const hannah = { memberId: 'm-1' }
const imogen = { memberId: 'm-5' }
const desk = { staffId: 'st-1' }

test('the timetable shows the places left', () => {
  const response = route('GET', '/classes', {}, hannah)
  assert.equal(response.status, 200)
  assert.deepEqual(
    response.body.map((entry) => entry.placesLeft),
    [11, 0, 1],
  )
})

test('a member can book a class with space', () => {
  const response = route('POST', '/classes/c-1/bookings', {}, imogen)
  assert.equal(response.status, 201)
  assert.equal(response.body.status, 'booked')
})

test('a full class turns members away', () => {
  assert.equal(route('POST', '/classes/c-2/bookings', {}, imogen).status, 409)
})

test('a member cannot book the same class twice', () => {
  assert.equal(route('POST', '/classes/c-1/bookings', {}, hannah).status, 409)
})

test('the roster is for staff only', () => {
  assert.equal(route('GET', '/classes/c-2/roster', {}, hannah).status, 401)
  const response = route('GET', '/classes/c-2/roster', {}, desk)
  assert.equal(response.status, 200)
  assert.equal(response.body.length, 4)
})
