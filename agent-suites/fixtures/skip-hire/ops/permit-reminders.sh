#!/bin/sh
# Run by cron at 07:00: which permits run out in the next two days. Usage: permit-reminders.sh [YYYY-MM-DD] [bookings.json]
cd "$(dirname "$0")/.." || exit 1
TODAY="${1:-$(date +%F)}" BOOKINGS="${2:-data/bookings.json}" node --input-type=module -e "
import { loadBookings } from './src/bookings.mjs'
import { expiringPermits } from './src/hire.mjs'
const due = expiringPermits(loadBookings(process.env.BOOKINGS), process.env.TODAY)
if (due.length === 0) console.log('No permits running out.')
for (const { booking, ends } of due) console.log(booking.ref + ' permit ends ' + ends + ': call ' + booking.customer + ' to renew or collect')
"
