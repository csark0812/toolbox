import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadJobs, mechanics } from '../src/jobs.mjs'

test('mechanics come in order of their first card', () => {
  assert.deepEqual(mechanics(loadJobs()), ['Ana', 'Tom', 'Priya'])
})
