import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fee, legacyRate, stayMinutes } from '../src/fees.mjs'
import { listStays } from '../src/stays.mjs'

const stay = (minutes) => ({
  plate: 'A',
  in: '2026-10-14T08:00:00Z',
  out: new Date(Date.parse('2026-10-14T08:00:00Z') + minutes * 60000).toISOString(),
})

test('measures a stay', () => {
  assert.equal(stayMinutes(stay(95)), 95)
})

test('charges by the hour', () => {
  assert.equal(fee(stay(60)), 300)
  assert.equal(fee(stay(120)), 600)
  assert.equal(fee(stay(10)), 300)
})

test('legacy tariff', () => {
  assert.equal(legacyRate(45), 240)
})

test('filters by plate', () => {
  assert.equal(listStays([stay(5), { ...stay(5), plate: 'B' }], 'B').length, 1)
})
