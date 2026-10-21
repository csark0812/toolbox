import { collect } from '../src/collect.mjs'
import { readRuns } from '../src/feed.mjs'
import { describeError, line } from '../src/format.mjs'

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const [first, second] = args.filter((arg) => arg !== '--strict')
const path = first?.includes('.') ? first : (second ?? 'data/runs.jsonl')
const cls = first?.includes('.') ? second : first

const feed = readRuns(path)
let skipped = 0
feed.on('skip', () => skipped++)
try {
  const runs = await collect(feed, (run) => !cls || run.class === cls)
  const top = runs.sort((a, b) => b.points - a.points).slice(0, 3)
  if (top.length === 0) console.log(`No runs${cls ? ` in ${cls}` : ''}.`)
  top.forEach((run, i) => console.log(`${i + 1}. ${line(run)}`))
  if (strict && skipped > 0) {
    console.error(`${skipped} line(s) skipped`)
    process.exitCode = 2
  }
} catch (error) {
  console.error(describeError(path, error))
  process.exitCode = 1
}
