import { readFileSync } from 'node:fs'
import { holdsAt } from './holds.mjs'

// ---------------------------------------------------------------- Time

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export function clockToMinutes(clock) {
  const [hours, minutes] = clock.split(':').map(Number)
  return hours * 60 + minutes
}

export function minutesToClock(total) {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/** A stop as the driver reads it: "Manea, Village hall". */
export const padStop = (stop, width = 34) => `${stop.village}, ${stop.name}`.padEnd(width)

const parseDate = (text) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text ?? '')) throw new Error(`Not a date: ${text}`)
  return new Date(`${text}T00:00:00Z`)
}
const formatDate = (date) => date.toISOString().slice(0, 10)
const dayName = (date) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getUTCDay()]

/** Week A or B of the cycle: A in even ISO weeks. */
export function weekOf(text) {
  const date = parseDate(text)
  const thursday = new Date(date)
  thursday.setUTCDate(date.getUTCDate() + 3 - ((date.getUTCDay() + 6) % 7))
  const firstThursday = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4))
  const week =
    1 +
    Math.round(
      (thursday - firstThursday) / 86400000 / 7 - 0.5 + ((firstThursday.getUTCDay() + 6) % 7) / 7,
    )
  return week % 2 === 0 ? 'A' : 'B'
}

// ---------------------------------------------------------------- Stops

const loadStops = () =>
  JSON.parse(readFileSync(new URL('../data/stops.json', import.meta.url), 'utf8')).map((stop) => ({
    ...stop,
    start: clockToMinutes(stop.arrive),
    end: clockToMinutes(stop.arrive) + stop.minutes,
  }))

export const STOPS = loadStops()

export function stopById(id) {
  const stop = STOPS.find((candidate) => candidate.id === id)
  if (!stop) throw new Error(`No stop ${id}`)
  return stop
}

/** What the enquiry desk reads out about a stop. */
export function describeStop(id, from) {
  const stop = stopById(id)
  const visit = nextVisit(stop, from)
  const waiting = holdsAt(stop.id)
  const lines = [
    `${stop.id}  ${stop.village}, ${stop.name}`,
    `  ${stop.day} ${stop.week === 'every' ? 'every week' : `week ${stop.week}`}, ${stop.arrive}-${minutesToClock(stop.end)}`,
    `  Next visit ${visit}`,
  ]
  lines.push(
    waiting.length
      ? `  ${waiting.length} waiting: ${waiting.map((hold) => hold.title).join('; ')}`
      : '  Nothing waiting',
  )
  return lines.join('\n')
}

// ---------------------------------------------------------------- Timetable

const groupByDay = (stops) => {
  const routes = new Map(DAYS.map((day) => [day, []]))
  for (const stop of stops) routes.get(stop.day).push(stop)
  for (const route of routes.values())
    route.sort((a, b) => a.start - b.start || a.id.localeCompare(b.id))
  return routes
}

const ROUTES = groupByDay(STOPS)

/** The stops the van makes on a day of week A or B, in order. */
export function routeFor(day, week) {
  if (!ROUTES.has(day)) throw new Error(`The van does not run on ${day}`)
  if (week !== 'A' && week !== 'B') throw new Error(`Week must be A or B, not ${week}`)
  return ROUTES.get(day).filter((stop) => stop.week === 'every' || stop.week === week)
}

/** The first day on or after `from` that the van calls at the stop, with the time. */
export function nextVisit(stop, from) {
  const date = parseDate(from)
  for (let offset = 0; offset < 14; offset++) {
    const day = new Date(date)
    day.setUTCDate(date.getUTCDate() + offset)
    const text = formatDate(day)
    if (dayName(day) === stop.day && (stop.week === 'every' || stop.week === weekOf(text)))
      return `${dayName(day)} ${text} at ${stop.arrive}`
  }
  throw new Error(`${stop.id} is never visited`)
}

/** One row per stop on the day's run: times, the drive from the last stop and the holds to hand over. */
export function runSheet(day, week) {
  let previous = null
  return routeFor(day, week).map((stop) => {
    const row = {
      stop,
      arrive: stop.start,
      leave: stop.end,
      drive: previous ? stop.start - previous.end : null,
      holds: holdsAt(stop.id).length,
    }
    previous = stop
    return row
  })
}

// ---------------------------------------------------------------- Printing

/** Prints a run sheet in one of the formats under formats/, loaded when asked for. */
export async function printRun(day, week, format = 'text') {
  if (!/^[a-z]+$/.test(format)) throw new Error(`No format ${format}`)
  let render
  try {
    ;({ render } = await import(`./formats/${format}.mjs`))
  } catch {
    throw new Error(`No format ${format}`)
  }
  return render(runSheet(day, week), { day, week })
}

// ---------------------------------------------------------------- Commands (bin/van.mjs calls <name>Command)

export async function runCommand([day, week = 'A', flag, format]) {
  return printRun(day, week, flag === '--format' ? format : undefined)
}

export function stopCommand([id, from]) {
  return describeStop(id, from)
}

export async function holdsCommand([from]) {
  const { holdsReport } = await import('./holds.mjs')
  return holdsReport(from)
}

export function weekCommand([from]) {
  const week = weekOf(from)
  const lines = [`Week ${week}`]
  for (const day of DAYS) {
    const route = routeFor(day, week)
    lines.push(
      route.length
        ? `${day}  ${String(route.length).padStart(2)} stops  ${minutesToClock(route[0].start)}-${minutesToClock(route.at(-1).end)}`
        : `${day}  no run`,
    )
  }
  return lines.join('\n')
}
