import { ENTRY_FEE, JUNIOR_AGE, PRIZES } from './config.mjs'

export const money = (pence) => `£${(pence / 100).toFixed(2)}`
export const PLACES = ['1st', '2nd', '3rd']

/** Each class with its entries, best first, and the top three placed. */
export function placings(classes, entries, scores) {
  return classes.map((show) => {
    const ranked = entries
      .filter((entry) => entry.class === show.class)
      .map((entry) => ({
        ...entry,
        points: scores.find((score) => score.entry === entry.entry).points,
      }))
      .sort((a, b) => (a.points < b.points ? 1 : -1))
    return { ...show, placed: ranked.slice(0, PLACES.length) }
  })
}

/** Prize money won by each exhibitor, most first. */
export function prizes(results, exhibitors) {
  const won = new Map()
  for (const result of results)
    result.placed.forEach((entry, place) =>
      won.set(entry.exhibitor, (won.get(entry.exhibitor) ?? 0) + PRIZES[place]),
    )
  return [...won]
    .map(([id, pence]) => ({ ...exhibitors.find((exhibitor) => exhibitor.id === id), pence }))
    .sort((a, b) => b.pence - a.pence || a.name.localeCompare(b.name))
}

/** Entry fees for each exhibitor. */
export function fees(exhibitors, entries) {
  return exhibitors.map((exhibitor) => {
    const count = entries.filter((entry) => entry.exhibitor === exhibitor.id).length
    const junior = exhibitor.age < JUNIOR_AGE
    return { ...exhibitor, count, pence: junior ? 0 : count * ENTRY_FEE }
  })
}
