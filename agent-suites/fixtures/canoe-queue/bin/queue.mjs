import { readFileSync } from 'node:fs'
import { assign, nextDue } from '../src/queue.mjs'

const load = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const returns = load('returns.json')
const waiting = load('waiting.json')

for (const row of assign(returns, waiting)) {
  if (!row.canoe) console.log(`${row.name.padEnd(8)}no canoe today`)
  else
    console.log(
      `${row.name.padEnd(8)}${row.canoe.padEnd(4)}at ${row.at.padStart(5)}  wait ${row.wait} min`,
    )
}
const next = nextDue(returns)
console.log(next ? `Next due back: ${next.canoe} at ${next.back}` : 'No canoes out')
