import { readFileSync } from 'node:fs'

const DEFAULTS = { maxPlayersPerLawn: 6, minPlayersPerLawn: 2, lawnNames: {} }

/** Club settings, with defaults for anything the file leaves out. */
export function loadConfig() {
  const file = JSON.parse(readFileSync(new URL('../config/club.json', import.meta.url), 'utf8'))
  return { ...DEFAULTS, ...file }
}

/** Every booking, one object per row of the spreadsheet export. */
export function loadBookings() {
  const text = readFileSync(new URL('../data/bookings.csv', import.meta.url), 'utf8')
  const [header, ...lines] = text.trim().split('\n')
  const keys = header.split(',')
  return lines.map((line) => {
    const cells = line.split(',')
    const row = Object.fromEntries(keys.map((key, i) => [key, cells[i]]))
    return { ...row, handicap: Number(row.handicap) }
  })
}

/** The bookings on one date, grouped by lawn, lawns in id order. */
export function lawnsOn(bookings, date) {
  const lawns = new Map()
  for (const booking of bookings.filter((b) => b.date === date).sort(byLawn)) {
    if (!lawns.has(booking.lawn)) lawns.set(booking.lawn, [])
    lawns.get(booking.lawn).push(booking)
  }
  for (const players of lawns.values())
    players.sort((a, b) => a.handicap - b.handicap || a.player.localeCompare(b.player))
  return lawns
}

/** Whether a lawn has too many, too few or the right number of players. */
export function lawnStatus(players, config) {
  if (players.length > config.maxPlayersPerLawn) return 'over'
  if (players.length < config.minPlayersPerLawn) return 'short'
  return 'ok'
}

/** The name the club uses for a lawn. */
export function lawnName(lawn, config) {
  return config.lawnNames[lawn] ?? `Lawn ${lawn}`
}

function byLawn(a, b) {
  return a.lawn.localeCompare(b.lawn)
}
