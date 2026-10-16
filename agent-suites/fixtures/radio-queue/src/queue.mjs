import { seededRandom, shuffle } from './shuffle.mjs'

const HOUR_MS = 60 * 60 * 1000

/** Ids of the tracks played in the hour before `now`. */
export function recentIds(plays, now) {
  return new Set(plays.filter((play) => play.at > now - HOUR_MS).map((play) => play.id))
}

/** The next `length` tracks: everything not played in the last hour, shuffled by `seed`. */
export function buildQueue(library, plays, { now, seed = 1, length = 8 }) {
  const recent = recentIds(plays, now)
  const eligible = library.filter((track) => !recent.has(track.id))
  return shuffle(eligible, seededRandom(seed)).slice(0, length)
}
