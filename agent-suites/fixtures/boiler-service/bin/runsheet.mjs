#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { formatDay } from '../src/report/dates.mjs'

const day = argv[2]
if (!/^\d{4}-\d{2}-\d{2}$/.test(day ?? '')) {
  stderr.write('usage: runsheet <YYYY-MM-DD>\n')
  exit(2)
}
const customers = JSON.parse(
  readFileSync(new URL('../data/customers.json', import.meta.url), 'utf8'),
)
const visits = customers.filter((customer) => customer.visit === day)
stdout.write(`Run sheet for ${formatDay(day)}\n`)
for (const [i, customer] of visits.entries())
  stdout.write(`${i + 1}. ${customer.street}, ${customer.name} (${customer.boiler})\n`)
if (!visits.length) stdout.write('No visits booked.\n')
// The van is restocked the working day after; Friday's restock is on Monday.
const next = new Date(`${day}T00:00:00Z`)
do next.setUTCDate(next.getUTCDate() + 1)
while ([0, 6].includes(next.getUTCDay()))
stdout.write(`Restock: ${formatDay(next)}\n`)
