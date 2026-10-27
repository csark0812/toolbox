import { readFileSync } from 'node:fs'

// ---- Seat plan --------------------------------------------------------------

export const BANDS = { A: 'front', B: 'front', C: 'middle', D: 'middle', E: 'back', F: 'back' }
export const SEATS_PER_ROW = 6
export const SEATS = Object.keys(BANDS).flatMap((row) =>
  Array.from({ length: SEATS_PER_ROW }, (_, i) => `${row}${i + 1}`),
)

export function bandFor(seat) {
  const band = BANDS[seat?.[0]]
  const number = Number(seat?.slice(1))
  if (!band || !Number.isInteger(number) || number < 1 || number > SEATS_PER_ROW)
    throw new Error(`No such seat: ${seat}`)
  return band
}

// ---- Pricing ----------------------------------------------------------------

export const BASE_PENCE = { front: 1450, middle: 1200, back: 950 }
export const SEASONS = { standard: 1, panto: 1.2, schools: 0.8 }

let season = 'standard'

export function setSeason(name) {
  if (!Object.hasOwn(SEASONS, name)) throw new Error(`Unknown season: ${name}`)
  season = name
}

export function currentSeason() {
  return season
}

export function roundPence(pence) {
  return Math.round(pence / 5) * 5
}

export function adultPrice(seat) {
  return roundPence(BASE_PENCE[bandFor(seat)] * SEASONS[season])
}

export function childPrice(seat) {
  return roundPence(adultPrice(seat) * 0.6)
}

export function concessionPrice(seat) {
  return Math.max(500, adultPrice(seat) - 300)
}

export const TICKET_TYPES = ['adult', 'child', 'concession']

export function priceFor(seat, type) {
  if (type === 'adult') return adultPrice(seat)
  if (type === 'child') return childPrice(seat)
  if (type === 'concession') return concessionPrice(seat)
  throw new Error(`Unknown ticket type: ${type}`)
}

export function pounds(pence) {
  return `£${(pence / 100).toFixed(2)}`
}

export function priceList() {
  const lines = [`Season: ${season}`]
  for (const band of Object.keys(BASE_PENCE)) {
    const seat = SEATS.find((each) => bandFor(each) === band)
    const prices = TICKET_TYPES.map((type) => `${type} ${pounds(priceFor(seat, type))}`)
    lines.push(`${band.padEnd(7)} ${prices.join('  ')}`)
  }
  return lines
}

// ---- Bookings ---------------------------------------------------------------

// What a sold-out house would take at today's adult prices.
const FULL_HOUSE_PENCE = SEATS.reduce((sum, seat) => sum + adultPrice(seat), 0)

export function loadBookings(path = 'data/bookings.json') {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function isTaken(bookings, show, seat) {
  return bookings.some((booking) => booking.show === show && booking.seat === seat)
}

export function book(bookings, show, seat, type) {
  bandFor(seat)
  if (isTaken(bookings, show, seat)) throw new Error(`${seat} is already booked for ${show}`)
  return { show, seat, type, pence: priceFor(seat, type) }
}

export function takingsReport(bookings) {
  const shows = [...new Set(bookings.map((booking) => booking.show))]
  return shows.map((show) => {
    const sold = bookings.filter((booking) => booking.show === show)
    const pence = sold.reduce((sum, booking) => sum + booking.pence, 0)
    const share = Math.round((pence / FULL_HOUSE_PENCE) * 100)
    return `${show.padEnd(10)} ${String(sold.length).padStart(2)} sold  ${pounds(pence).padStart(7)}  ${share}% of a full house`
  })
}

export function freeSeatsReport(bookings) {
  const shows = [...new Set(bookings.map((booking) => booking.show))]
  return shows.map((show) => {
    const free = SEATS.filter((seat) => !isTaken(bookings, show, seat))
    return `${show.padEnd(10)} ${free.length} free, front ${free.filter((seat) => bandFor(seat) === 'front').length}`
  })
}
