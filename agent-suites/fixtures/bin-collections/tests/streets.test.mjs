import assert from 'node:assert/strict'
import { test } from 'node:test'
import { findStreet } from '../src/streets.mjs'

const streets = [{ street: 'Mill Lane', rule: 'weekly on Tue' }]

test('streets are found however the name is typed', () => {
  assert.equal(findStreet(streets, ' mill lane ').rule, 'weekly on Tue')
})

test('an unknown street is not found', () => {
  assert.equal(findStreet(streets, 'Mill Road'), undefined)
})
