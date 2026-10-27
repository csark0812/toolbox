import { lawnName, loadBookings, loadConfig } from '../src/lawns.mjs'

const config = loadConfig()
console.log('date,player,lawn,lawn_name')
for (const booking of loadBookings())
  console.log(
    [booking.date, booking.player, booking.lawn, lawnName(booking.lawn, config)].join(','),
  )
