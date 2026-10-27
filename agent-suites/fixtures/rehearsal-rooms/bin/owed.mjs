import { loadBookings, loadRooms, owed, pounds } from '../src/charges.mjs'

const rows = owed(loadBookings(), loadRooms())
console.log('Owed')
for (const row of rows)
  console.log(
    `  ${row.id}  ${row.date}  ${row.start}-${row.end}  Room ${row.room}  ${row.band.padEnd(16)}${pounds(row.pence)}`,
  )
console.log(`Total ${pounds(rows.reduce((sum, row) => sum + row.pence, 0))}`)
