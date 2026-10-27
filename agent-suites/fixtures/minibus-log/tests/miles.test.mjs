import assert from 'node:assert/strict'
import { test } from 'node:test'
import { charge, totalMiles } from '../src/miles.mjs'

test('miles add up across trips', () => {
  assert.equal(totalMiles([{ miles: 10 }, { miles: 15 }]), 25)
  assert.equal(totalMiles([]), 0)
})

test('the charge is 40p a mile', () => {
  assert.equal(charge(25), 10)
})
