import assert from 'node:assert/strict'
import { test } from 'node:test'
import { net } from '../src/payouts.mjs'

test('takes the rounded fee', () => {
  assert.equal(net(10000, 0.029), 9710)
  assert.equal(net(1050, 0.1), 945)
})
