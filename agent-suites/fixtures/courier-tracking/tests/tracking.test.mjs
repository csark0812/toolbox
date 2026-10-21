import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { route } from '../src/api.mjs'
import { reset } from '../src/store.mjs'

beforeEach(reset)

test('anyone can follow a parcel', () => {
  const response = route('GET', '/track/SW1048227')
  assert.equal(response.status, 200)
  assert.equal(response.body.status, 'attempted')
  assert.equal(response.body.events.length, 3)
})

test('tracking never shows who the parcel is for', () => {
  const response = route('GET', '/track/SW1048213')
  assert.equal(response.body.recipientId, undefined)
  assert.doesNotMatch(JSON.stringify(response.body), /Pritchard|Ffordd|07700/)
})

test('an unknown number is not found', () => {
  assert.equal(route('GET', '/track/SW0000000').status, 404)
})
