import assert from 'node:assert/strict'
import { test } from 'node:test'
import { progression, standingsAfter } from '../src/standings.mjs'

const fixture = (round, home, away, homeGoals, awayGoals) => ({
  round,
  home,
  away,
  homeGoals,
  awayGoals,
})
const season = {
  teams: ['Ash', 'Birch', 'Cedar'],
  fixtures: [
    fixture(1, 'Ash', 'Birch', 2, 0),
    fixture(2, 'Birch', 'Cedar', 1, 1),
    fixture(3, 'Cedar', 'Ash', null, null),
    fixture(3, 'Birch', 'Ash', 3, 1),
  ],
}
const order = (table) => table.map((row) => row.team)

test('three points for a win, one for a draw', () => {
  const table = standingsAfter(season, 3)
  assert.deepEqual(order(table), ['Birch', 'Ash', 'Cedar'])
  assert.deepEqual(
    table.map((row) => row.points),
    [4, 3, 1],
  )
})

test('goal difference separates teams on equal points', () => {
  const table = standingsAfter(season, 2)
  assert.deepEqual(order(table), ['Ash', 'Cedar', 'Birch'])
  assert.equal(table[2].goalDifference, -2)
})

test('unplayed fixtures do not count', () => {
  assert.equal(standingsAfter(season, 3).find((row) => row.team === 'Cedar').played, 1)
})

test('one table per round', () => {
  const tables = progression(season)
  assert.equal(tables.length, 3)
  assert.deepEqual(
    tables.map((t) => t[0].team),
    ['Ash', 'Ash', 'Birch'],
  )
})
