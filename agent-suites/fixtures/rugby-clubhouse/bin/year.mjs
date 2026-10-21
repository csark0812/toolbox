import { argv, exit } from 'node:process'
import { loadYear, pounds, summary } from '../src/takings.mjs'

const year = argv[2]
if (!/^\d{4}$/.test(year ?? '')) {
  console.error('Usage: npm run year -- YYYY')
  exit(1)
}
const s = summary(loadYear(year))
console.log(`Clubhouse bar takings, ${year}`)
console.log(`  Slips    ${s.slips}`)
console.log(`  Sales    ${pounds(s.sales)}`)
console.log(`  Refunds  ${pounds(s.refunds)}`)
console.log(`  Net      ${pounds(s.net)}`)
