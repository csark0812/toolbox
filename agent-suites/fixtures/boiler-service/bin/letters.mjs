#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { dueIn } from '../src/due.mjs'
import { render } from '../src/render.mjs'

const month = argv[2]
if (!/^\d{4}-\d{2}$/.test(month ?? '')) {
  stderr.write('usage: letters <YYYY-MM>\n')
  exit(2)
}
const customers = JSON.parse(
  readFileSync(new URL('../data/customers.json', import.meta.url), 'utf8'),
)
const letters = dueIn(customers, month).map((customer) =>
  render(customer.visit ? 'booked' : 'reminder', customer),
)
stdout.write(letters.join('\n----\n\n'))
