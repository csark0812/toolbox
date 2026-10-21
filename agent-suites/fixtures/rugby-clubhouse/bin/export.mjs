import { argv, exit } from 'node:process'
import { amountOf, loadMonth } from '../src/takings.mjs'

const month = argv[2]
if (!/^\d{4}-\d{2}$/.test(month ?? '')) {
  console.error('Usage: npm run export -- YYYY-MM')
  exit(1)
}
console.log('date,till,kind,amount')
for (const record of loadMonth(month))
  console.log([record.date, record.till, record.kind, amountOf(record).toFixed(2)].join(','))
