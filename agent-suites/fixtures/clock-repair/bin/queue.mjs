// The bench queue. npm run queue [-- --urgent] [--date YYYY-MM-DD] [--file jobs.json]
import { parseOptions } from '../src/args.mjs'
import { loadConfig } from '../src/config.mjs'
import { loadJobs } from '../src/jobs.mjs'
import { isUrgent, urgentDueDate, urgentQueue } from '../src/urgent.mjs'

let parsed
try {
  parsed = parseOptions(process.argv.slice(2), {
    urgent: 'boolean',
    date: 'string',
    file: 'string',
  })
} catch (error) {
  console.error(error.message)
  process.exit(2)
}
const { options } = parsed
const config = loadConfig()
let jobs = urgentQueue(loadJobs(options.file))
if (options.urgent) jobs = jobs.filter(isUrgent)
if (jobs.length === 0) console.log('Nothing on the bench.')
for (const job of jobs) {
  const due = urgentDueDate(job, config)
  const flags = [isUrgent(job) ? 'URGENT' : '', options.date && due < options.date ? 'OVERDUE' : '']
    .filter(Boolean)
    .join(' ')
  console.log(
    `${job.ref}  due ${due}  ${job.customer.padEnd(14)} ${job.item.padEnd(15)} ${flags}`.trimEnd(),
  )
}
