import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bookingLine, clashes, footer } from '../src/bookings.mjs'

const at = (day, start, end) => ({ member: 'Test', day, start, end })

test('overlapping sessions clash', () => {
  assert.equal(clashes(at('Wed', '10:00', '12:30'), at('Wed', '12:00', '13:00')), true)
})

test('different days never clash', () => {
  assert.equal(clashes(at('Tue', '10:00', '12:00'), at('Wed', '10:00', '12:00')), false)
})

test('formats a booking line', () => {
  assert.equal(bookingLine(at('Sat', '09:00', '11:00')), 'Sat 09:00-11:00  Test')
})

test('footer names the steward', () => {
  assert.equal(footer(), 'Questions: Ruth Pike')
})
