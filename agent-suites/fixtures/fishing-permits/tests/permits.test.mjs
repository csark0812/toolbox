import assert from 'node:assert/strict'
import { test } from 'node:test'
import { priceFor, quote } from '../src/index.mjs'
import { describe, quotePermit } from '../src/permits.mjs'
import { lakeDayTicket, seasonTicket, weekTicket } from '../src/presets.mjs'

test('a water bills its minimum days', () => {
  assert.equal(quotePermit('test', 1).days, 2)
  assert.equal(quotePermit('test').pence, 11000)
})

test('a week or more is billed at the week rate', () => {
  assert.equal(quotePermit('avon', 7).pence, 10710)
})

test('juniors get the concession unless told otherwise', () => {
  assert.equal(quotePermit('kennet', 2, 'junior').pence, 2880)
  assert.equal(quotePermit('kennet', 2, 'junior', 1, false).pence, 3200)
})

test('the rod limit is enforced', () => {
  assert.throws(() => quotePermit('test', 2, 'adult', 2), /at most 1 rods/)
})

test('presets', () => {
  assert.equal(describe(lakeDayTicket()), 'Club lake: 1 day, adult, 1 rod = £9.00')
  assert.equal(seasonTicket('kennet', 'adult').concession, true)
  assert.equal(weekTicket('kennet', 'junior').concession, false)
})

test('the public entry', () => {
  assert.equal(priceFor('kennet', 3, 'adult'), '£96.00')
  assert.equal(quote('avon', 2).pence, 3600)
})
