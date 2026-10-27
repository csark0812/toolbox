import { readFileSync } from 'node:fs'
import { mailOut, mergeSubscribers } from '../src/merge.mjs'

const rows = JSON.parse(readFileSync(new URL('../data/subscribers.json', import.meta.url), 'utf8'))
const list = mergeSubscribers(rows)
for (const entry of list)
  console.log(
    `${entry.valid ? ' ' : '!'} ${entry.email.padEnd(30)} ${entry.name.padEnd(16)} ${String(entry.joined ?? '-').padEnd(10)} ${entry.unsubscribed ? 'unsubscribed' : 'subscribed  '} ${entry.tags.join(', ')}`,
  )
console.log(`${list.length} entries from ${rows.length} rows, ${mailOut(list).length} to mail`)
