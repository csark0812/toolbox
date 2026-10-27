import { readFileSync } from 'node:fs'
import { schedule } from '../src/schedule.mjs'

const slots = JSON.parse(readFileSync(new URL('../data/slots.json', import.meta.url), 'utf8'))
for (const line of schedule(slots)) console.log(line)
