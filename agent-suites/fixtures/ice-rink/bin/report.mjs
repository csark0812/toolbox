import { argv } from 'node:process'
import { weeklyReport } from '../src/report.mjs'

const path = argv[2] ?? 'data/sessions.json'
try {
  for (const entry of await weeklyReport(path))
    console.log(`${entry.type.padEnd(14)}${String(entry.booked).padStart(5)} of ${entry.capacity}`)
} catch (error) {
  console.error(`Could not read ${path}: ${error.code ?? error.message}`)
  process.exitCode = 1
}
