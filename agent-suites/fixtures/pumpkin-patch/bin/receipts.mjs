// Reprint the day's receipts. npm run receipts [-- --file data/other-day.json]
import { readFileSync } from 'node:fs'
import { pounds } from '../src/money.mjs'

const PER_KG = { carving: 120, giant: 85, munchkin: 240, crown: 180 }

// Sales rung up before the till knew varieties have none; they were all carving pumpkins.
function linePence(kg, variety) {
  const rate = PER_KG[variety] ?? PER_KG.carving
  return Math.round((kg * rate) / 10) * 10
}

const args = process.argv.slice(2)
const at = args.indexOf('--file')
const file = at === -1 ? 'data/sales.json' : args[at + 1]
let sales
try {
  sales = JSON.parse(readFileSync(file, 'utf8'))
} catch (error) {
  console.error(`Could not read ${file}: ${error.code ?? error.message}`)
  process.exit(1)
}
for (const sale of sales) {
  console.log(`Receipt ${sale.id}  ${sale.time}`)
  let total = 0
  for (const item of sale.items) {
    const pence = linePence(item.kg, item.variety)
    total += pence
    console.log(
      `  ${(item.variety ?? 'pumpkin').padEnd(9)} ${item.kg.toFixed(2).padStart(6)} kg  ${pounds(pence).padStart(7)}`,
    )
  }
  console.log(`  ${'Total'.padEnd(19)}  ${pounds(total).padStart(7)}`)
  console.log('')
}
