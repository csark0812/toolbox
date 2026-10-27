import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { collect } from '../src/collect.mjs'
import { readRuns } from '../src/feed.mjs'

const data = (name) => fileURLToPath(new URL(`../data/${name}`, import.meta.url))

test('scored runs come through in order', async () => {
  const runs = await collect(readRuns(data('runs.jsonl')))
  assert.deepEqual(
    runs.map((run) => run.dog),
    ['Fly', 'Moss', 'Cap', 'Gyp', 'Spot', 'Roy', 'Lass'],
  )
})

test('retired and disqualified runs are skipped with their line', (t, done) => {
  const skips = []
  const feed = readRuns(data('runs.jsonl'))
  feed.on('skip', (skip) => skips.push(skip.line))
  feed.on('end', (count) => {
    assert.deepEqual(skips, [4, 8])
    assert.equal(count, 7)
    done()
  })
})

test('a broken line stops the feed', (t, done) => {
  const seen = []
  const feed = readRuns(data('broken.jsonl'))
  feed.on('run', (run) => seen.push(run.dog))
  feed.on('error', (error) => {
    assert.equal(error.line, 4)
    assert.deepEqual(seen, ['Fly', 'Cap'])
    done()
  })
})

test('a missing file is an error', async () => {
  await assert.rejects(collect(readRuns('no-such-file.jsonl')), { code: 'ENOENT' })
})
