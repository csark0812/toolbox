import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { argv, exit } from 'node:process'

const [date, till, value, refund] = argv.slice(2)
if (
  !/^\d{4}-\d{2}-\d{2}$/.test(date ?? '') ||
  !['front', 'back'].includes(till) ||
  !/^\d+(\.\d{1,2})?$/.test(value ?? '')
) {
  console.error('Usage: npm run add -- YYYY-MM-DD front|back 12.50 [refund]')
  exit(1)
}
const file = new URL(`../data/takings/${date.slice(0, 7)}.json`, import.meta.url)
const records = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : []
const kind = refund === 'refund' ? 'refund' : 'sale'
records.push({ date, till, kind, amount: kind === 'refund' ? -Number(value) : Number(value) })
writeFileSync(file, JSON.stringify(records, null, 2) + '\n')
console.log(`added ${kind} of £${Number(value).toFixed(2)} on ${date}`)
