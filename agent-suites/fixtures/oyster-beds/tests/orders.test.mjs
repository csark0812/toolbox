import assert from 'node:assert/strict'
import { test } from 'node:test'
import { packLine } from '../src/orders.mjs'

test('a pack line names the customer, the grade and the quantity', () => {
  const line = packLine({ customer: 'Sandbar', grade: 'No.1', dozens: 2 })
  assert.match(line, /^Sandbar +No\.1 +2 dozen$/)
})
