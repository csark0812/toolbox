import assert from 'node:assert/strict'
import { test } from 'node:test'
import { standings } from '../src/league.mjs'

const teams = [{ name: 'Quizzly Bears', aliases: ['QB'] }, { name: 'Les Quizerables' }]
const night = (date, ...entries) => ({ date, entries })
const sheet = (team, rounds, joker) => ({ team, rounds, joker })

test('aliases and spacing match the registered team', () => {
  const [row] = standings(teams, [night('2026-09-03', sheet(' qb ', [5, 5], 1))])
  assert.deepEqual(row, { team: 'Quizzly Bears', played: 1, points: 10, quiz: 15, wins: 1 })
})

test('teams on the same score share the place', () => {
  const rows = standings(teams, [
    night('2026-09-03', sheet('QB', [5, 5], 3), sheet('Les Quizerables', [4, 6])),
  ])
  assert.deepEqual(
    rows.map((row) => [row.team, row.points, row.wins]),
    [
      ['Les Quizerables', 10, 1],
      ['Quizzly Bears', 10, 1],
    ],
  )
})

test('an unregistered team does not take a place', () => {
  const rows = standings(teams, [
    night('2026-09-03', sheet('Ringers', [10, 10]), sheet('QB', [5, 5])),
  ])
  assert.equal(rows[0].points, 10)
})

test('only the best ten nights count', () => {
  const nights = Array.from({ length: 12 }, (_, i) =>
    night(
      `2026-09-${String(i + 1).padStart(2, '0')}`,
      sheet('QB', [i < 2 ? 1 : 5]),
      sheet('Les Quizerables', [3]),
    ),
  )
  const bears = standings(teams, nights).find((row) => row.team === 'Quizzly Bears')
  assert.deepEqual(bears, { team: 'Quizzly Bears', played: 12, points: 100, quiz: 50, wins: 10 })
})
