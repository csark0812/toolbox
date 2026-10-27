import { once } from 'node:events'
import { readRuns } from '../src/feed.mjs'
import { describeError } from '../src/format.mjs'

const path = process.argv[2] ?? 'data/runs.jsonl'
try {
  const [total] = await once(readRuns(path), 'end')
  console.log(`Total runs: ${total}`)
} catch (error) {
  console.error(describeError(path, error))
  process.exitCode = 1
}
