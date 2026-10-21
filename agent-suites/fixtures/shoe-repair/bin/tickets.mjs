import { readFileSync } from 'node:fs'
import { ticket } from '../src/tickets.mjs'

const jobs = JSON.parse(readFileSync(new URL('../data/jobs.json', import.meta.url), 'utf8'))
for (const job of jobs) console.log(ticket(job))
