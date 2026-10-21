import assert from 'node:assert/strict'
import { test } from 'node:test'
import { customerLine } from '../src/customers.mjs'

test('a customer shows their address, order and days', () => {
  assert.equal(
    customerLine({ name: 'Mr Hale', address: '9 Mill Lane', pints: 1, days: ['Mon', 'Thu'] }),
    'Mr Hale      9 Mill Lane        1 pint   Mon Thu',
  )
})
