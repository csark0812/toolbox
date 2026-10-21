import assert from 'node:assert/strict'
import { test } from 'node:test'
import { latestWeighIn, releaseStatus } from '../src/release.mjs'

test('the most recent weigh-in is used, whatever order they were entered in', () => {
  const hog = {
    name: 'X',
    weighIns: [
      { date: '2026-10-09', grams: 610 },
      { date: '2026-09-01', grams: 400 },
      { date: '2026-09-20', grams: 520 },
    ],
  }
  assert.deepEqual(latestWeighIn(hog), { date: '2026-10-09', grams: 610 })
})

test('a heavy enough hog is ready and a light one is not', () => {
  assert.deepEqual(releaseStatus({ name: 'A', weighIns: [{ date: '2026-10-01', grams: 650 }] }), {
    grams: 650,
    ready: true,
  })
  assert.deepEqual(releaseStatus({ name: 'B', weighIns: [{ date: '2026-10-01', grams: 540 }] }), {
    grams: 540,
    ready: false,
  })
})
