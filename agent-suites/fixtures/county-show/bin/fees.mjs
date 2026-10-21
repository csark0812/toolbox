import { read } from '../src/data.mjs'
import { fees, money } from '../src/show.mjs'

for (const row of fees(read('exhibitors.json'), read('entries.json')))
  console.log(
    `  ${row.name.padEnd(12)}${String(row.count).padStart(2)} ${row.count === 1 ? 'entry  ' : 'entries'}  ${money(row.pence)}  ${row.pence === 0 ? 'free' : row.paid ? 'paid' : 'owes'}`,
  )
