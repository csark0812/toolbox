import assert from 'node:assert/strict'
import { test } from 'node:test'
import { episodeList, formatEpisode } from '../src/episodes.mjs'

test('formats an episode line', () => {
  assert.equal(
    formatEpisode({ number: 3, title: 'Container math', seconds: 3905 }),
    '3. Container math (65 min)',
  )
})

test('lists episodes one per line', () => {
  const list = episodeList([
    { number: 1, title: 'A', seconds: 60 },
    { number: 2, title: 'B', seconds: 120 },
  ])
  assert.equal(list, '1. A (1 min)\n2. B (2 min)')
})
