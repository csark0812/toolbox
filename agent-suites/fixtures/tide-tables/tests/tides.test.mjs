import assert from 'node:assert/strict'
import { test } from 'node:test'
import { nextHighWaters } from '../src/tides.mjs'

const tides = [
  { id: 'T1', port: 'Dartmouth', kind: 'high', time: '2026-11-02T06:12', height: 4.6 },
  { id: 'T2', port: 'Dartmouth', kind: 'low', time: '2026-11-02T12:20', height: 1.1 },
  { id: 'T3', port: 'DARTMOUTH ', kind: 'high', time: '2026-11-02T18:31', height: 4.4 },
]

test('the next high water skips low waters and matches the port however it is typed', () => {
  assert.deepEqual(
    nextHighWaters(tides, [{ id: 'q', port: 'dartmouth', at: '2026-11-02T09:15' }]),
    [{ query: 'q', tide: 'T3', minutes: 556 }],
  )
})

test('a high water at the asked minute has already arrived', () => {
  assert.equal(
    nextHighWaters(tides, [{ id: 'q', port: 'Dartmouth', at: '2026-11-02T06:12' }])[0].tide,
    'T3',
  )
})

test('no later high water gives no answer', () => {
  assert.deepEqual(
    nextHighWaters(tides, [{ id: 'q', port: 'Dartmouth', at: '2026-11-02T19:00' }]),
    [{ query: 'q', tide: null, minutes: null }],
  )
})
