import assert from 'node:assert/strict'
import { test } from 'node:test'
import { schedule } from '../src/schedule.mjs'

const slots = [
  { time: '09:30', grower: 'Begum', kg: 12 },
  { time: '09:00', grower: 'Hollins', kg: 60 },
]

test('slots are listed in time order', () => {
  assert.deepEqual(schedule(slots), ['09:00  Hollins  60 kg', '09:30  Begum  12 kg'])
})
