import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatTime, results } from '../src/results.mjs'

const course = { id: 'Blue', controls: [41, 47] }
const runner = (bib, name, start, finish, punches) => ({
  bib,
  name,
  club: 'SROC',
  course: 'Blue',
  start,
  finish,
  punches: punches.map(([code, time]) => ({ code, time })),
})

test('finishers are placed by time with shared places and leg ranks', () => {
  const [{ results: rows }] = results(
    [course],
    [
      runner(1, 'Bea', '10:00:00', '10:20:00', [
        [41, '10:05:00'],
        [47, '10:12:00'],
      ]),
      runner(2, 'Ana', '10:01:00', '10:21:00', [
        [41, '10:05:00'],
        [47, '10:14:00'],
      ]),
      runner(3, 'Cal', '10:02:00', '10:30:00', [
        [41, '10:08:00'],
        [47, '10:16:00'],
      ]),
    ],
  )
  assert.deepEqual(
    rows.map((row) => [row.name, row.place, row.behind, row.splits.map((split) => split.rank)]),
    [
      ['Ana', 1, 0, [1, 3, 1]],
      ['Bea', 1, 0, [2, 1, 2]],
      ['Cal', 3, 480, [3, 2, 3]],
    ],
  )
})

test('extra punches are fine, a missing control is a mispunch and no finish is a DNF', () => {
  const [{ results: rows }] = results(
    [course],
    [
      runner(1, 'Dev', '10:00:00', null, [
        [41, '10:05:00'],
        [47, '10:12:00'],
      ]),
      runner(2, 'Esme', '10:00:00', '10:20:00', [
        [47, '10:03:00'],
        [41, '10:05:00'],
      ]),
      runner(3, 'Femi', '10:00:00', '10:20:00', [
        [41, '10:05:00'],
        [33, '10:07:00'],
        [47, '10:12:00'],
      ]),
    ],
  )
  assert.deepEqual(
    rows.map((row) => [row.name, row.status, row.time, row.splits.length]),
    [
      ['Femi', 'OK', 1200, 3],
      ['Esme', 'MP', null, 1],
      ['Dev', 'DNF', null, 2],
    ],
  )
})

test('a night run past midnight is timed from its start', () => {
  const [{ results: rows }] = results(
    [course],
    [
      runner(1, 'Gus', '23:55:00', '00:10:00', [
        [41, '23:59:00'],
        [47, '00:04:00'],
      ]),
    ],
  )
  assert.equal(rows[0].time, 900)
  assert.equal(formatTime(rows[0].time), '15:00')
  assert.equal(formatTime(3725), '1:02:05')
})
