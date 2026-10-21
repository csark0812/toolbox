// Permit applications to send to the councils today. npm run permits [-- bookings.json]
import { loadBookings } from '../src/bookings.mjs'
import { needsPermit, permitApplication } from '../src/hire.mjs'

const road = loadBookings(process.argv[2]).filter(needsPermit)
if (road.length === 0) console.log('No permits needed.')
for (const booking of road) {
  console.log(permitApplication(booking))
  console.log('')
}
