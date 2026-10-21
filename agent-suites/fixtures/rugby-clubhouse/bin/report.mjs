import { argv, exit } from 'node:process'
import { loadMonth, pounds, summary } from '../src/takings.mjs'

const month = argv[2]
if (!/^\d{4}-\d{2}$/.test(month ?? '')) {
  console.error('Usage: npm run report -- YYYY-MM')
  exit(1)
}
const s = summary(loadMonth(month))
console.log(`Clubhouse bar takings, ${month}`)
console.log(`  Slips        ${s.slips}`)
console.log(`  Front till   ${pounds(s.front)}`)
console.log(`  Back till    ${pounds(s.back)}`)
console.log(`  Sales        ${pounds(s.sales)}`)
console.log(`  Refunds      ${pounds(s.refunds)}`)
console.log(`  Net          ${pounds(s.net)}`)
