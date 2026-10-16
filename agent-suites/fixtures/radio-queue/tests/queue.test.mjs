import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseHistory } from '../src/history.mjs'
import { buildQueue, recentIds } from '../src/queue.mjs'
import { seededRandom, shuffle } from '../src/shuffle.mjs'

const library = [
  { id: 1, title: 'A', artist: 'x', seconds: 100 },
  { id: 2, title: 'B', artist: 'y', seconds: 100 },
  { id: 3, title: 'C', artist: 'z', seconds: 100 },
]
const now = new Date('2026-10-16T10:00:00Z')

test('parses the playout log', () => {
  const plays = parseHistory('2026-10-16T09:30:00Z,2\n\n2026-10-16T09:40:00Z,3\n')
  assert.equal(plays.length, 2)
  assert.equal(plays[1].at.toISOString(), '2026-10-16T09:40:00.000Z')
})

test('only counts plays from the last hour', () => {
  const plays = [
    { at: new Date('2026-10-16T08:30:00Z'), id: 1 },
    { at: new Date('2026-10-16T09:30:00Z'), id: 2 },
  ]
  assert.deepEqual([...recentIds(plays, now)], [2])
})

test('leaves out recently played tracks', () => {
  const plays = [{ at: new Date('2026-10-16T09:30:00Z'), id: 2 }]
  const queue = buildQueue(library, plays, { now, seed: 3 })
  assert.deepEqual(queue.map((track) => track.id).sort(), [1, 3])
})

test('the same seed gives the same order', () => {
  const items = Array.from({ length: 20 }, (_, i) => i)
  assert.deepEqual(shuffle(items, seededRandom(9)), shuffle(items, seededRandom(9)))
  assert.notDeepEqual(shuffle(items, seededRandom(9)), items)
})
