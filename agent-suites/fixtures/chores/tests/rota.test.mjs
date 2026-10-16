import assert from 'node:assert/strict'
import { test } from 'node:test'
import { rota, weekNumber } from '../src/rota.mjs'

const house = { members: [{ name: 'A' }, { name: 'B' }, { name: 'C' }], chores: ['x', 'y'] }

test('parses ISO weeks', () => {
  assert.equal(weekNumber('2026-W01') + 1, weekNumber('2026-W02'))
  assert.throws(() => weekNumber('2026-42'), RangeError)
})

test('moves every chore along each week', () => {
  const now = rota(house, '2026-W10').map((row) => row.member)
  const next = rota(house, '2026-W11').map((row) => row.member)
  const names = ['A', 'B', 'C']
  assert.deepEqual(
    next,
    now.map((name) => names[(names.indexOf(name) + 1) % 3]),
  )
})
