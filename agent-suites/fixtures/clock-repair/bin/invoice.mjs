// npm run invoice -- <ref> [--file jobs.json]
import { parseOptions } from '../src/args.mjs'
import { loadConfig } from '../src/config.mjs'
import { invoiceLines } from '../src/invoice.mjs'
import { findJob, loadJobs, pounds } from '../src/jobs.mjs'
import { urgentDueDate } from '../src/urgent.mjs'

let parsed
try {
  parsed = parseOptions(process.argv.slice(2), { file: 'string' })
} catch (error) {
  console.error(error.message)
  process.exit(2)
}
const [ref] = parsed.rest
const job = findJob(loadJobs(parsed.options.file), ref)
if (!job) {
  console.error(`No job ${ref ?? '(none given)'}`)
  process.exit(1)
}
const config = loadConfig()
const { lines, net, vat, total } = invoiceLines(job, config)
console.log(`Tick & Chime  invoice for ${job.ref}`)
console.log(`${job.customer}, ${job.item}, ready by ${urgentDueDate(job, config)}`)
for (const line of lines)
  console.log(`  ${line.label.padEnd(28)} ${pounds(line.pence).padStart(9)}`)
console.log(`  ${'Net'.padEnd(28)} ${pounds(net).padStart(9)}`)
console.log(`  ${'VAT'.padEnd(28)} ${pounds(vat).padStart(9)}`)
console.log(`  ${'Total'.padEnd(28)} ${pounds(total).padStart(9)}`)
