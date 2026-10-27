import assert from 'node:assert/strict'
import { test } from 'node:test'
import { lawnName, lawnStatus, lawnsOn } from '../src/lawns.mjs'

const config = { maxPlayersPerLawn: 2, minPlayersPerLawn: 2, lawnNames: { A: 'Top lawn' } }
const bookings = [
  { date: 'd1', player: 'Bo', lawn: 'B', handicap: 3 },
  { date: 'd1', player: 'Al', lawn: 'A', handicap: 5 },
  { date: 'd1', player: 'Cy', lawn: 'A', handicap: 1 },
  { date: 'd2', player: 'Di', lawn: 'A', handicap: 1 },
]

test('lawns on a date are grouped and players sorted by handicap', () => {
  const lawns = lawnsOn(bookings, 'd1')
  assert.deepEqual([...lawns.keys()], ['A', 'B'])
  assert.deepEqual(
    lawns.get('A').map((b) => b.player),
    ['Cy', 'Al'],
  )
})

test('a lawn is short, ok or over', () => {
  assert.equal(lawnStatus([1], config), 'short')
  assert.equal(lawnStatus([1, 2], config), 'ok')
  assert.equal(lawnStatus([1, 2, 3], config), 'over')
})

test('a lawn with no name falls back to its id', () => {
  assert.equal(lawnName('A', config), 'Top lawn')
  assert.equal(lawnName('Z', config), 'Lawn Z')
})
