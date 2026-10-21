import { readFileSync } from 'node:fs'
import { STOPS, nextVisit, stopById } from './library.mjs'

const HOLDS = JSON.parse(readFileSync(new URL('../data/holds.json', import.meta.url), 'utf8'))

/** The reserved books waiting on the van for a stop, oldest first. */
export function holdsAt(stopId) {
  return HOLDS.filter((hold) => hold.stop === stopId).sort(
    (a, b) => a.placed.localeCompare(b.placed) || a.id.localeCompare(b.id),
  )
}

/** Every stop with holds waiting, in the order the van will next reach them. */
export function holdsReport(from) {
  const visits = STOPS.filter((stop) => holdsAt(stop.id).length).map((stop) => ({
    stop,
    visit: nextVisit(stop, from),
  }))
  visits.sort(
    (a, b) =>
      a.visit.slice(4).localeCompare(b.visit.slice(4)) || a.stop.id.localeCompare(b.stop.id),
  )
  const lines = []
  for (const { stop, visit } of visits) {
    lines.push(`${visit}  ${stopById(stop.id).village}, ${stop.name}`)
    for (const hold of holdsAt(stop.id)) lines.push(`  ${hold.id}  ${hold.borrower}  ${hold.title}`)
  }
  return lines.length ? lines.join('\n') : 'No holds waiting'
}
