import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { JobTimeout, runWithTimeout } from '../src/runner.mjs'

const bin = fileURLToPath(new URL('../bin/run.mjs', import.meta.url))
const run = (...args) => execFileSync(process.execPath, [bin, ...args], { encoding: 'utf8' })

test('returns the job result', async () => {
  assert.equal(await runWithTimeout(async () => 'done', 100), 'done')
})

test('times out slow jobs', async () => {
  await assert.rejects(
    runWithTimeout(() => new Promise((resolve) => setTimeout(resolve, 200)), 20),
    JobTimeout,
  )
})

test('dry run shows the timeout in milliseconds', () => {
  assert.equal(run('send-digests', '--dry-run'), 'would run send-digests with a 30000ms timeout\n')
  assert.equal(
    run('send-digests', '--timeout', '5', '--dry-run'),
    'would run send-digests with a 5000ms timeout\n',
  )
})
