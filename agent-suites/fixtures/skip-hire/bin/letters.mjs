// Letters for the neighbours of every skip that will sit outside the customer's own ground.
import { loadBookings } from '../src/bookings.mjs'

// Same idea as needsPermit in src/hire.mjs.
function needsPermit(booking) {
  return booking.placement !== 'driveway' && booking.placement !== 'private'
}

const bookings = loadBookings(process.argv[2])
const due = bookings.filter((booking) => needsPermit(booking))
if (due.length === 0) console.log('No letters today.')
for (const booking of due) {
  console.log(`Dear neighbour,`)
  console.log(
    `A skip will be placed on the ${booking.placement} outside ${booking.address} from ${booking.start} for ${booking.weeks} week${booking.weeks === 1 ? '' : 's'}.`,
  )
  console.log(`Questions? Call Avon Skips on 0117 496 0000 and quote ${booking.ref}.`)
  console.log('---')
}
