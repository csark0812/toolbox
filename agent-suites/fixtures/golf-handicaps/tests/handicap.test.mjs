import assert from 'node:assert/strict'
import { test } from 'node:test'
import { differential, handicapHistory } from '../src/handicap.mjs'

const courses = [{ name: 'Heath', rating: 689, slope: 118 }]
const round = (id, player, date, gross) => ({ id, player, date, course: 'Heath', gross })

test('differentials are in tenths', () => {
  assert.equal(differential(round('R1', 'Ann', '2026-09-05', 84), courses), 145)
})

test('no index until the third round, then the best of them', () => {
  const history = handicapHistory(
    [
      round('R1', 'Ann Kerr', '2026-09-05', 84),
      round('R2', 'ann kerr', '2026-09-12', 90),
      round('R3', 'ANN KERR', '2026-09-19', 80),
    ],
    courses,
  )
  assert.deepEqual(
    history.map((entry) => entry.index),
    [null, null, 106],
  )
})

test('an unknown course is an error', () => {
  const rounds = [
    round('R1', 'Ann', '2026-09-05', 84),
    { ...round('R2', 'Ann', '2026-09-12', 84), course: 'Moor' },
    round('R3', 'Ann', '2026-09-19', 84),
  ]
  assert.throws(() => handicapHistory(rounds, courses), /Unknown course Moor/)
})
