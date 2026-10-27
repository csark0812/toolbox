import assert from 'node:assert/strict'
import { test } from 'node:test'
import { board } from '../src/outings.mjs'

const outings = [
  {
    id: 'R2',
    start: '2026-11-07T07:30',
    boat: 'Kestrel',
    class: '4x',
    crew: ['Ben', 'Cal', 'Dee', 'Eve'],
  },
  { id: 'R1', start: '2026-11-07T07:00', boat: 'Heron', class: '1x', crew: ['Ana'] },
]

test('the board lists outings in start order', () => {
  assert.deepEqual(board(outings), [
    '2026-11-07  07:00  Heron   1x',
    '2026-11-07  07:30  Kestrel 4x',
  ])
})
