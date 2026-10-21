import assert from 'node:assert/strict'
import { test } from 'node:test'
import { principals, sortPlayers } from '../src/players.mjs'

const players = [
  { name: 'B', section: 'violin', chair: 2 },
  { name: 'A', section: 'violin', chair: 1 },
  { name: 'C', section: 'cello', chair: 1 },
]

test('players sort by chair, then name', () => {
  assert.deepEqual(
    sortPlayers(players, 'chair').map((p) => p.name),
    ['A', 'C', 'B'],
  )
})

test('principals sit in chair 1', () => {
  assert.deepEqual(
    principals(players).map((p) => p.name),
    ['A', 'C'],
  )
})

test('an unknown sort field is refused', () => {
  assert.throws(() => sortPlayers(players, 'age'), RangeError)
})
