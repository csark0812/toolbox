import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createFakeServer } from '../src/fake-server.mjs'
import { chunk, uploadFile } from '../src/upload.mjs'

const text = Buffer.from('abcdefghijklmnopqrstuvwxyz0123456789')

test('chunks a buffer', () => {
  assert.deepEqual(
    chunk(Buffer.from('abcdefg'), 3).map((part) => part.toString()),
    ['abc', 'def', 'g'],
  )
})

test('uploads a file', async () => {
  const server = createFakeServer()
  const result = await uploadFile(text, server, { chunkSize: 5, concurrency: 3 })
  assert.equal(result.file.toString(), text.toString())
  assert.equal(server.stats.maxInFlight, 3)
})

test('gives up after the retries are used', async () => {
  const server = createFakeServer({ failures: { 0: 9 } })
  await assert.rejects(uploadFile(text, server, { chunkSize: 5, retries: 2 }), /503 for part 0/)
})
