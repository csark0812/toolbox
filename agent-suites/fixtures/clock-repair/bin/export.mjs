// CSV for the insurer's claims system, one row per job, with the due date added.
// npm run export [-- --file jobs.json]
import { parseOptions } from '../src/args.mjs'
import { loadConfig } from '../src/config.mjs'
import { loadJobs } from '../src/jobs.mjs'
import { urgentDueDate } from '../src/urgent.mjs'

let parsed
try {
  parsed = parseOptions(process.argv.slice(2), { file: 'string' })
} catch (error) {
  console.error(error.message)
  process.exit(2)
}
const config = loadConfig()
const rows = loadJobs(parsed.options.file).map((job) => ({
  ...job,
  due: urgentDueDate(job, config),
}))
const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))]
const cell = (value) => {
  const text = value === undefined ? '' : String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
console.log(columns.join(','))
for (const row of rows) console.log(columns.map((column) => cell(row[column])).join(','))
