import { monthOf, shortMonthLabel } from '../src/dates.mjs'
import { byDate, loadYear, pounds, seatsTaken } from '../src/outings.mjs'

const year = Number(process.argv[2])
if (!year) {
  console.error('usage: npm run year -- YYYY')
  process.exit(1)
}
const { trips, bookings } = loadYear(year)
const months = new Map()
for (const trip of [...trips].sort(byDate)) {
  const month = monthOf(trip.date)
  if (!month.startsWith(String(year))) continue
  const row = months.get(month) ?? { trips: 0, passengers: 0, pence: 0 }
  const taken = seatsTaken(bookings, trip)
  row.trips += 1
  row.passengers += taken
  row.pence += taken * trip.farePence
  months.set(month, row)
}
console.log(`Outings ${year}`)
let total = 0
for (const [month, row] of months) {
  total += row.pence
  console.log(
    `  ${shortMonthLabel(month)}  ${row.trips} ${row.trips === 1 ? 'trip ' : 'trips'}  ${String(row.passengers).padStart(3)} passengers  ${pounds(row.pence)}`,
  )
}
console.log(`Total ${pounds(total)}`)
