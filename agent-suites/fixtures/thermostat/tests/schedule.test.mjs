import assert from 'node:assert/strict'
import { test } from 'node:test'
import { localTime } from '../src/clock.mjs'
import { activeBlock } from '../src/schedule.mjs'

const weekday = {
  day: 'Weekday',
  blocks: [
    ['06:30', 20],
    ['22:30', 15],
  ],
}
const schedule = { timeZone: 'UTC', days: Array.from({ length: 7 }, () => weekday) }

test('reads local time in the home zone', () => {
  assert.deepEqual(localTime(new Date('2026-10-14T05:45:00Z'), 'Europe/Dublin'), {
    weekday: 3,
    minutes: 405,
  })
})

test('picks the block that has started', () => {
  assert.equal(activeBlock(schedule, new Date('2026-10-14T07:00:00Z')).target, 20)
  assert.equal(activeBlock(schedule, new Date('2026-10-14T23:00:00Z')).target, 15)
})

test('carries the night block over midnight', () => {
  assert.equal(activeBlock(schedule, new Date('2026-10-14T03:00:00Z')).target, 15)
})
