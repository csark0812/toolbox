#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { money, ticket } from '../src/jobs.mjs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const job = read('jobs.json').find((entry) => entry.id === argv[2])
if (!job) {
  stderr.write(`ticket: no job ${argv[2] ?? ''}\n`)
  exit(1)
}
const phone = read('customers.json')[job.customer] ?? 'no number'
const { lines, total } = ticket(job)
stdout.write(`Job ${job.id}  ${job.customer} (${phone})  ${job.bike}\n`)
for (const line of lines)
  stdout.write(`  ${line.label.padEnd(22)}${money(line.pence).padStart(9)}\n`)
stdout.write(`  ${'Total'.padEnd(22)}${money(total).padStart(9)}\n`)
