import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { route } from '../src/api.mjs'
import { reset } from '../src/store.mjs'

beforeEach(reset)
const margaret = { accountRef: 'CT-40118' }

test('a resident signs in with their reference and postcode', () => {
  const body = { accountRef: 'CT-40118', postcode: 'hf2 7qd' }
  const response = route('POST', '/sign-in', { body })
  assert.equal(response.status, 200)
  assert.equal(response.body.accountRef, 'CT-40118')
})

test('a wrong postcode is turned away', () => {
  const body = { accountRef: 'CT-40118', postcode: 'HF1 2AB' }
  assert.equal(route('POST', '/sign-in', { body }).status, 401)
})

test('the bill shows what is left to pay', () => {
  const response = route('GET', '/account', { now: new Date('2026-10-21T09:00Z') }, margaret)
  assert.equal(response.status, 200)
  assert.equal(response.body.totalPence, 186000)
  assert.equal(response.body.leftToPayPence, 55800)
})

test('the bill needs a session', () => {
  assert.equal(route('GET', '/account', {}, null).status, 401)
})
