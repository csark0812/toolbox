import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { route } from '../src/api.mjs'
import { reset } from '../src/store.mjs'

beforeEach(reset)
const hannah = { customerId: 'c-1' }
const mei = { customerId: 'c-3' }
const counter = { staffId: 's-1' }

test('a customer sees only their own rentals', () => {
  const response = route('GET', '/rentals', {}, hannah)
  assert.equal(response.status, 200)
  assert.deepEqual(
    response.body.map((entry) => entry.id),
    ['r-1', 'r-4'],
  )
})

test('a free instrument can be rented and the first month runs 30 days', () => {
  const response = route('POST', '/instruments/in-5/rentals', {}, mei)
  assert.equal(response.status, 201)
  assert.equal(response.body.paidUntil, '2026-11-21')
  assert.equal(response.body.monthsPaid, 1)
})

test('an instrument on an overdue rental cannot be rented', () => {
  assert.equal(route('POST', '/instruments/in-4/rentals', {}, mei).status, 409)
})

test('a returned instrument can be rented again', () => {
  assert.equal(route('POST', '/instruments/in-3/rentals', {}, mei).status, 201)
})

test('a payment moves paidUntil on 30 days and clears overdue', () => {
  const response = route('POST', '/rentals/r-2/payments', {}, counter)
  assert.equal(response.status, 200)
  assert.equal(response.body.paidUntil, '2026-09-13')
  assert.equal(response.body.status, 'active')
})

test('only the shop records payments', () => {
  assert.equal(route('POST', '/rentals/r-1/payments', {}, hannah).status, 401)
})

test('signing in is required', () => {
  assert.equal(route('GET', '/rentals', {}, null).status, 401)
})
