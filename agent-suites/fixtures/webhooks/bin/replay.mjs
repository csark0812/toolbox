#!/usr/bin/env node
// Replays recorded endpoint responses with a simulated clock and prints a delivery log.
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { deliver } from '../src/deliver.mjs'

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const config = read('../config/webhooks.json')
const recorded = read('../data/responses.json')

const seconds = (ms) => `+${String(Math.round(ms / 1000)).padStart(4)}s`
for (const { event, endpoint, responses } of recorded) {
  let clock = 0
  let next = 0
  const result = await deliver(
    { id: event },
    async () => responses[Math.min(next++, responses.length - 1)],
    config,
    { now: () => clock, sleep: async (ms) => void (clock += ms) },
  )
  for (const { at, attempt, status } of result.log)
    stdout.write(`${event} ${endpoint} ${seconds(at)} attempt ${attempt} -> ${status}\n`)
  stdout.write(
    `${event} ${endpoint} ${result.delivered ? 'delivered' : 'gave up'} after ${result.attempts} attempts\n`,
  )
}
