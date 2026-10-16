#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { parseHistory } from '../src/history.mjs'
import { buildQueue } from '../src/queue.mjs'

const { values } = parseArgs({
  options: { at: { type: 'string' }, seed: { type: 'string' }, length: { type: 'string' } },
})
const read = (file) => readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8')
const library = JSON.parse(read('library.json'))
const plays = parseHistory(read('played.log'))
const now = values.at ? new Date(values.at) : new Date()
const queue = buildQueue(library, plays, {
  now,
  seed: Number(values.seed ?? 1),
  length: Number(values.length ?? 8),
})
for (const [index, track] of queue.entries()) {
  const time = `${Math.floor(track.seconds / 60)}:${String(track.seconds % 60).padStart(2, '0')}`
  console.log(`${String(index + 1).padStart(2)}. ${track.title} - ${track.artist} (${time})`)
}
