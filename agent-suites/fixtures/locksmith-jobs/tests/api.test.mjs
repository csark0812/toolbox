import assert from 'node:assert/strict'
import { test } from 'node:test'
import { route } from '../src/api.mjs'

const hannah = { customerId: 'c-7' }

test('a customer sees their own job', () => {
  assert.equal(route('GET', '/jobs/J-1030', { query: {} }, hannah).status, 200)
})

test("someone else's job is not found", () => {
  assert.equal(route('GET', '/jobs/J-1031', { query: {} }, hannah).status, 404)
})

test('signing in is required', () => {
  assert.equal(route('GET', '/jobs', { query: {} }, null).status, 401)
})

test('the first page is the newest ten', () => {
  const page = route('GET', '/jobs', { query: { page: '1' } }, hannah).body
  assert.equal(page.length, 10)
  assert.equal(page[0].id, 'J-1052')
})
