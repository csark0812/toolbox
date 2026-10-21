import assert from 'node:assert/strict'
import { test } from 'node:test'
import { daySlots } from '../src/slots.mjs'

const slot = (rows, time) => rows.find((row) => row.slot === time)
const ticket = (fields) => ({
  ref: 'T',
  date: '2026-11-07',
  slot: '10:00',
  channel: 'online',
  status: 'paid',
  ...fields,
})

test('tickets in the same slot add up', () => {
  const rows = daySlots(
    [ticket({ type: 'adult', qty: 30 }), ticket({ type: 'child', qty: 12 })],
    '2026-11-07',
  )
  assert.deepEqual(slot(rows, '10:00'), { slot: '10:00', places: 42, full: true })
})

test('a refunded ticket frees its places', () => {
  const rows = daySlots([ticket({ type: 'adult', qty: 4, status: 'refunded' })], '2026-11-07')
  assert.equal(slot(rows, '10:00').places, 0)
})

test('infants go free', () => {
  const rows = daySlots(
    [ticket({ type: 'adult', qty: 2 }), ticket({ type: 'infant', qty: 1 })],
    '2026-11-07',
  )
  assert.equal(slot(rows, '10:00').places, 2)
})

test('other days are left out', () => {
  const rows = daySlots([ticket({ type: 'adult', qty: 5, date: '2026-11-08' })], '2026-11-07')
  assert.equal(slot(rows, '10:00').places, 0)
})
