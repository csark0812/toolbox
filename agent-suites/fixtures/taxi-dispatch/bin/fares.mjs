import { readFileSync } from 'node:fs'
import { FIRM } from '../src/config.mjs'
import { byDriver, fare, inOrder, money } from '../src/fares.mjs'

const jobs = inOrder(
  JSON.parse(readFileSync(new URL('../data/jobs.json', import.meta.url), 'utf8')),
)
console.log(`${FIRM}: fares`)
for (const job of jobs)
  console.log(
    `  ${job.id}  ${job.date} ${job.time}  ${job.driver.padEnd(6)}${money(fare(job)).padStart(7)}  ${job.payment}`,
  )
console.log('Drivers')
for (const [driver, pence] of byDriver(jobs))
  console.log(`  ${driver.padEnd(6)}${money(pence).padStart(7)}`)
console.log(`Total ${money(jobs.reduce((sum, job) => sum + fare(job), 0))}`)
