import assert from 'node:assert/strict'
import { test } from 'node:test'
import { halfHours, invoice } from '../src/billing.mjs'

test('a half-hour walk is one half hour', () => {
  assert.equal(halfHours(30), 1)
  assert.equal(halfHours(60), 2)
})

test("an invoice adds up the dog's walks", () => {
  const walks = [
    { date: '2026-10-12', dog: 'Rolo', minutes: 60, walker: 'Tom' },
    { date: '2026-10-13', dog: 'Pepper', minutes: 30, walker: 'Priya' },
  ]
  assert.equal(invoice(walks, 'Rolo').total, 2400)
})
