// Hidden acceptance for the uploader fix: parts are assembled in file order no matter which
// chunk finishes first (retries and uneven latency), uploads stay parallel, retries still give up
// after the limit, and the demo succeeds over the flaky connection.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { uploadFile } = await import(pathToFileURL(join(dir, 'src/upload.mjs')).href)
const { createFakeServer } = await import(pathToFileURL(join(dir, 'src/fake-server.mjs')).href)
let seed = 7
const next = () => (seed = (seed * 48271) % 2147483647)
for (let round = 0; round < 25; round++) {
  const bytes = Buffer.from(Array.from({ length: 40 + (next() % 400) }, () => next() % 256))
  const chunkSize = 8 + (next() % 24)
  const parts = Math.ceil(bytes.length / chunkSize)
  const failures = {}
  for (let i = 0; i < 3; i++) failures[next() % parts] = 1 + (next() % 2)
  const delays = new Map()
  const server = createFakeServer({
    failures,
    latency: (part, attempt) => {
      const key = `${part}:${attempt}`
      if (!delays.has(key)) delays.set(key, next() % 6)
      return delays.get(key)
    },
  })
  const concurrency = 2 + (next() % 4)
  const result = await uploadFile(bytes, server, { chunkSize, concurrency, retries: 3 })
  assert.ok(Buffer.from(result.file).equals(bytes), `round ${round}: the file is stitched in order`)
  if (parts >= concurrency)
    assert.ok(server.stats.maxInFlight > 1, `round ${round}: chunks are still sent in parallel`)
}
const big = Buffer.from(Array.from({ length: 400 }, (_, i) => i % 251))
const parallel = createFakeServer({ latency: () => 3 })
await uploadFile(big, parallel, { chunkSize: 10, concurrency: 4 })
assert.equal(parallel.stats.maxInFlight, 4, 'concurrency is honored')
await assert.rejects(
  uploadFile(big, createFakeServer({ failures: { 3: 5 } }), { chunkSize: 10, retries: 2 }),
  /503 for part 3/,
  'a part that keeps failing still fails the upload after the retries',
)
const counted = createFakeServer({ failures: { 2: 2 } })
await uploadFile(big, counted, { chunkSize: 100, retries: 3, concurrency: 2 })
assert.equal(counted.stats.requests, 6, 'four parts plus two retries, nothing re-sent needlessly')
const out = execFileSync(process.execPath, ['bin/demo.mjs'], { cwd: dir, encoding: 'utf8' })
assert.match(out, /^clean connection: ok, 412 bytes/m)
assert.match(out, /^flaky connection: ok, 412 bytes/m)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
