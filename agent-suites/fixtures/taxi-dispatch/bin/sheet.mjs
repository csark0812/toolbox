import { readFileSync } from 'node:fs'
import { argv, exit } from 'node:process'
import { FIRM } from '../src/config.mjs'
import { inOrder } from '../src/fares.mjs'

const day = argv[2]
if (!/^\d{4}-\d{2}-\d{2}$/.test(day ?? '')) {
  console.error('Usage: npm run sheet -- YYYY-MM-DD')
  exit(1)
}
const jobs = JSON.parse(readFileSync(new URL('../data/jobs.json', import.meta.url), 'utf8'))
console.log(`${FIRM}: day sheet for ${day}`)
for (const job of inOrder(jobs).filter((job) => job.date === day))
  console.log(`  ${job.time}  ${job.pickup.padEnd(22)}${job.dropoff.padEnd(22)}${job.driver}`)
