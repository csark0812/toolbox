import { readFileSync } from 'node:fs'

export const FIELDS = ['name', 'section', 'chair']

/** Every player in the orchestra. */
export function loadPlayers() {
  return JSON.parse(readFileSync(new URL('../data/players.json', import.meta.url), 'utf8'))
}

/** Players sorted by one of their fields, then by name. */
export function sortPlayers(players, field = 'name') {
  if (!FIELDS.includes(field)) throw new RangeError(`cannot sort by "${field}"`)
  return [...players].sort((a, b) =>
    a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : a.name.localeCompare(b.name),
  )
}

/** The players who lead their section. */
export function principals(players) {
  return players.filter((player) => player.chair === 1)
}
