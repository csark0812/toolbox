import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bill, overstayPence } from '../src/bills.mjs'
import { rateAt } from '../src/tariff.mjs'

const session = (fields) => ({ id: 'T1', driver: 'Test', bay: '1', date: '2026-10-01', ...fields })

test('peak runs from 16:00 up to 19:00', () => {
  assert.equal(rateAt('15:59'), 28)
  assert.equal(rateAt('16:00'), 45)
  assert.equal(rateAt('19:00'), 28)
})

test('no overstay inside the grace period', () => {
  assert.equal(overstayPence(session({ chargeEnd: '10:00', unplug: '10:30' })), 0)
})

test('overstay is charged per started 10 minutes after the grace', () => {
  assert.equal(overstayPence(session({ chargeEnd: '10:00', unplug: '10:41' })), 100)
})

test('an off-peak session is billed at 28p per kWh', () => {
  const readings = [
    { session: 'T1', time: '09:00', kwh: 100 },
    { session: 'T1', time: '09:15', kwh: 102.5 },
    { session: 'T1', time: '09:30', kwh: 105 },
  ]
  const result = bill(session({ plugIn: '09:00', chargeEnd: '09:30', unplug: '09:45' }), readings)
  assert.deepEqual(result, { kwh: 5, energy: 140, overstay: 0, total: 140 })
})
