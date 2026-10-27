import assert from 'node:assert/strict'
import { test } from 'node:test'
import { RATES, tillPrice } from '../bin/till.mjs'

test('prices by the kilo to the nearest 10p', () => {
  assert.equal(tillPrice(4.2, 'carving'), 500)
  assert.equal(tillPrice(0.45, 'munchkin'), 110)
  assert.equal(tillPrice(2.8, 'crown'), 500)
})

test('knows four varieties', () => {
  assert.deepEqual(Object.keys(RATES), ['carving', 'giant', 'munchkin', 'crown'])
})

test('refuses a variety it does not know', () => {
  assert.throws(() => tillPrice(2, 'turban'), /Unknown variety: turban/)
})
