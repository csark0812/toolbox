#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { createFakeServer } from '../src/fake-server.mjs'
import { uploadFile } from '../src/upload.mjs'

const bytes = readFileSync(new URL('../data/sample.txt', import.meta.url))
const options = { chunkSize: 64, concurrency: 3, retries: 3 }
for (const [label, server] of [
  ['clean connection', createFakeServer()],
  ['flaky connection', createFakeServer({ failures: { 1: 1, 4: 2 } })],
]) {
  try {
    const result = await uploadFile(bytes, server, options)
    stdout.write(`${label}: ok, ${result.bytes} bytes, ${server.stats.requests} requests\n`)
  } catch (error) {
    stdout.write(`${label}: FAILED (${error.message})\n`)
  }
}
