import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { departureBoards } from '../src/boards.mjs'

const timetable = JSON.parse(
  readFileSync(new URL('../data/timetable.json', import.meta.url), 'utf8'),
)
const board = (date, stop) => departureBoards(timetable, date).find((entry) => entry.stop === stop)

test('same-minute departures are ordered by route number', () => {
  assert.deepEqual(
    board('2026-11-02', 'MKT')
      .departures.slice(0, 3)
      .map((departure) => departure.route),
    ['1', '2', '10'],
  )
})

test('after-midnight departures come last and are shown on the clock', () => {
  assert.deepEqual(board('2026-11-02', 'UNI').departures.at(-1), {
    time: '00:15',
    route: 'N1',
    trip: 'N1-2415',
    to: 'Victoria',
  })
})

test('an exception replaces the weekday service', () => {
  assert.deepEqual(
    board('2026-12-25', 'VIC').departures.map((departure) => departure.trip),
    ['1-0830S'],
  )
})

test('every stop gets a board', () => {
  assert.deepEqual(
    departureBoards(timetable, '2026-11-01').map((entry) => entry.departures.length),
    [1, 1, 0, 0],
  )
})
