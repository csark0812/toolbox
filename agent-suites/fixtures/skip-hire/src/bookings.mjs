import { readFileSync } from 'node:fs'

export const loadBookings = (path = 'data/bookings.json') => JSON.parse(readFileSync(path, 'utf8'))
export const pounds = (pence) => `£${(pence / 100).toFixed(2)}`
