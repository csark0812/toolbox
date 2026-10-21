import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fee, money } from '../src/berths.mjs'

test('the fee follows the length bands', () => {
  assert.equal(fee({ lengthM: 8 }), 2200)
  assert.equal(fee({ lengthM: 8.1 }), 3000)
  assert.equal(fee({ lengthM: 12 }), 3000)
  assert.equal(fee({ lengthM: 14 }), 4000)
})

test('money is shown in pounds', () => {
  assert.equal(money(2250), '£22.50')
  assert.equal(money(-1100), '-£11.00')
})
