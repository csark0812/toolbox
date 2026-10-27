import assert from 'node:assert/strict'
import { test } from 'node:test'
import { price } from '../src/pricing.mjs'

const at = (start, end) => ({ day: 'Mon', start, end })

test('daytime bookings pay the day rate', () => {
  assert.equal(price(at('09:30', '11:30')), 24)
})

test('late evening bookings pay the evening rate', () => {
  assert.equal(price(at('19:00', '22:00')), 45)
})
