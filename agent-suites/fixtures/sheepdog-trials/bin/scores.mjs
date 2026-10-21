import { readRuns } from '../src/feed.mjs'
import { describeError, line } from '../src/format.mjs'

const path = process.argv[2] ?? 'data/runs.jsonl'
const feed = readRuns(path)
feed.on('run', (run) => console.log(line(run)))
feed.on('skip', ({ line: n, reason }) => console.error(`skipped line ${n}: ${reason}`))
feed.on('end', (count) => console.log(`${count} runs`))
feed.on('error', (error) => {
  console.error(describeError(path, error))
  process.exitCode = 1
})
