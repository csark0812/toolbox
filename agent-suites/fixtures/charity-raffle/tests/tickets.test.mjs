import assert from 'node:assert/strict'
import { test } from 'node:test'
import { handleBuy } from '../src/api.mjs'

test('tickets are numbered in order', () => {
  const tickets = []
  handleBuy({}, { supporterId: 's-1' }, tickets)
  assert.equal(handleBuy({}, { supporterId: 's-2' }, tickets).body.number, '2')
})

test('buying needs a session', () => {
  assert.equal(handleBuy({}, null, []).status, 401)
})
