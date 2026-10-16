import assert from 'node:assert/strict'
import { test } from 'node:test'
import { openSwaps } from '../src/board.mjs'
import { formatShift } from '../src/format.mjs'

const shift = (id, start, swap = true) => ({
  id,
  role: 'picker',
  worker: 'Ana',
  start,
  end: start,
  swap,
})

test('lists swaps earliest first', () => {
  const shifts = [
    shift('b', '2026-10-21T08:00:00Z'),
    shift('a', '2026-10-20T08:00:00Z'),
    shift('c', '2026-10-19T08:00:00Z', false),
  ]
  assert.deepEqual(
    openSwaps(shifts).map((s) => s.id),
    ['a', 'b'],
  )
})

test('formats a shift', () => {
  assert.equal(
    formatShift({
      id: 'X',
      role: 'picker',
      worker: 'Ana',
      start: '2026-10-20T04:00:00Z',
      end: '2026-10-20T12:00:00Z',
    }),
    'X  2026-10-20 04:00-12:00 UTC  Ana',
  )
})
