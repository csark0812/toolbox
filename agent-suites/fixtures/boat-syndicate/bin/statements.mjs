import { readFileSync } from 'node:fs'
import { statements } from '../src/statements.mjs'

const { members, trips, costs } = JSON.parse(
  readFileSync(new URL('../data/books.json', import.meta.url), 'utf8'),
)
const money = (pence) => `${pence < 0 ? '-' : ''}£${(Math.abs(pence) / 100).toFixed(2)}`
for (const statement of statements(members, trips, costs)) {
  console.log(`${statement.name}: ${money(statement.total)}`)
  for (const line of statement.lines)
    console.log(`  ${line.cost.padEnd(18)} ${money(line.pence).padStart(9)}`)
}
