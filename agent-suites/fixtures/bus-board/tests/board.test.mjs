import assert from 'node:assert/strict'
import { test } from 'node:test'
import { departures, when } from '../src/board.mjs'

const timetable = [
  { route: '1', to: 'A', stop: 'S', time: '10:00' },
  { route: '1', to: 'A', stop: 'S', time: '10:05' },
  { route: '2', to: 'B', stop: 'S', time: '10:30' },
  { route: '2', to: 'B', stop: 'T', time: '10:01' },
]

test('next departures from the stop, soonest first', () => {
  const list = departures({ id: 'S', walkMinutes: 0 }, timetable, '10:00')
  assert.deepEqual(
    list.map((d) => [d.time, when(d)]),
    [
      ['10:00', 'due'],
      ['10:05', '5 min'],
      ['10:30', '10:30'],
    ],
  )
})

test('gone buses are not shown', () => {
  assert.equal(departures({ id: 'S', walkMinutes: 0 }, timetable, '10:06').length, 1)
})
