import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dueRound } from '../src/round.mjs'

const pianos = [
  { client: 'Ms Lowe', town: 'Ashby', piano: 'upright', lastTuned: '2026-06-01' },
  { client: 'Mr Venn', town: 'Ashby', piano: 'grand', lastTuned: '2026-10-01' },
]

test('the round lists the pianos due a tuning', () => {
  assert.deepEqual(dueRound(pianos, '2027-01-15'), ['Ms Lowe  upright'])
})
