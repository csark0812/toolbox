import assert from 'node:assert/strict'
import { test } from 'node:test'
import { total } from '../src/invoice.mjs'

test('adds rounded tax', () => {
  assert.equal(total([{ unitCents: 999, qty: 2 }], 0.1), 2198)
})
