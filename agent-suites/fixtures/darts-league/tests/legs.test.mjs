import assert from 'node:assert/strict'
import { test } from 'node:test'
import { legLine } from '../src/legs.mjs'

test('a leg shows the night, the players and the winning visit', () => {
  assert.equal(
    legLine({
      night: '2026-09-10',
      winner: 'Raj Bhatt',
      loser: 'Lou Hart',
      checkout: 't19 s18 d16',
    }),
    '2026-09-10  Raj Bhatt   beat Lou Hart    T19 S18 D16',
  )
})
