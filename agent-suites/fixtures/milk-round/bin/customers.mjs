import { readFileSync } from 'node:fs'
import { customerLine } from '../src/customers.mjs'

const customers = JSON.parse(
  readFileSync(new URL('../data/customers.json', import.meta.url), 'utf8'),
)
for (const customer of customers) console.log(customerLine(customer))
