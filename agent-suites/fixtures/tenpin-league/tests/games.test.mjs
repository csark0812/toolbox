import assert from 'node:assert/strict'
import { test } from 'node:test'
import { gameLine } from '../src/games.mjs'

test('a game shows the night, the bowler and the sheet', () => {
  assert.equal(
    gameLine({ night: '2026-09-03', bowler: 'Ann Price', sheet: 'x 7/ 9- x -8 8/ -6 x x x81' }),
    '2026-09-03  Ann Price   X 7/ 9- X -8 8/ -6 X X X81',
  )
})
