import assert from 'node:assert/strict'
import { test } from 'node:test'
import { scheduleNight, slotEnd } from '../src/schedule.mjs'

test('the first request for a slot gets it', () => {
  const results = scheduleNight(
    [
      { night: '2026-11-12', slot: '21:00', member: 'Omar Haddad' },
      { night: '2026-11-12', slot: '21:00', member: 'Ivy Chen' },
    ],
    { taken: [] },
  )
  assert.deepEqual(
    results.map((result) => result.status),
    ['booked', 'slot taken'],
  )
})

test('slots are an hour long and wrap past midnight', () => {
  assert.equal(slotEnd('21:00'), '22:00')
  assert.equal(slotEnd('23:00'), '00:00')
})
