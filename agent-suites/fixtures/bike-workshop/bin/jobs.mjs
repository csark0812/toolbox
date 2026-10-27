import { loadJobs } from '../src/jobs.mjs'

for (const { card, mechanic, bike, time } of loadJobs())
  console.log(`#${card} ${mechanic}: ${bike}, ${time}`)
