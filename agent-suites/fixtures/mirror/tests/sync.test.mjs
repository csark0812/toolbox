import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mapLimit } from '../src/pool.mjs'
import { formatBytes, syncAll } from '../src/sync.mjs'

test('keeps input order', async () => {
  const results = await mapLimit([30, 10, 20], 2, (ms) => new Promise((r) => setTimeout(r, ms, ms)))
  assert.deepEqual(
    results.map((result) => result.value),
    [30, 10, 20],
  )
})

test('summarizes uploads', async () => {
  const files = [
    { path: 'a', bytes: 100 },
    { path: 'b', bytes: 200 },
  ]
  const summary = await syncAll(files, async (file) => {
    if (file.path === 'b') throw new Error('nope')
    return file.path
  })
  assert.deepEqual(summary, { uploaded: 1, failed: ['b'], bytes: 100 })
})

test('formats sizes', () => {
  assert.equal(formatBytes(512), '512 B')
  assert.equal(formatBytes(2048), '2.0 KB')
})
