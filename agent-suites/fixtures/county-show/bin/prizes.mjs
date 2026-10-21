import { points, read } from '../src/data.mjs'
import { money, placings, prizes } from '../src/show.mjs'

const results = placings(read('classes.json'), read('entries.json'), points())
const rows = prizes(results, read('exhibitors.json'))
for (const row of rows)
  console.log(`  ${row.name.padEnd(13)}${row.village.padEnd(10)}${money(row.pence)}`)
console.log(`Prize money ${money(rows.reduce((sum, row) => sum + row.pence, 0))}`)
