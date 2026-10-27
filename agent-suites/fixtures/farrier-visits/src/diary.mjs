import { readFileSync } from 'node:fs'
import { priceFor } from './prices.mjs'

const load = (name) =>
  JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), 'utf8'))
export const loadHorses = () => load('horses')
export const loadVisits = () => load('visits')

// What the farrier does on the next visit.
export function workFor(horse) {
  if (horse.shoes === 'all') return 'all'
  if (horse.shoes === 'front') return 'front'
  return 'trim'
}

export function intervalWeeks(horse) {
  return horse.shoes ? 6 : 8
}

const addDays = (date, days) => {
  const next = new Date(`${date}T00:00:00Z`)
  next.setUTCDate(next.getUTCDate() + days)
  return next.toISOString().slice(0, 10)
}

export function nextVisit(horse) {
  const date = addDays(horse.lastVisit, intervalWeeks(horse) * 7)
  const work = workFor(horse)
  return { horse: horse.name, yard: horse.yard, date, work, price: priceFor(work, date) }
}

export function round(horses) {
  return horses
    .map(nextVisit)
    .sort((a, b) => a.date.localeCompare(b.date) || a.horse.localeCompare(b.horse))
}

export function owed(visits) {
  return visits
    .filter((visit) => !visit.paid)
    .map((visit) => ({ ...visit, price: priceFor(visit.work, visit.date) }))
}
