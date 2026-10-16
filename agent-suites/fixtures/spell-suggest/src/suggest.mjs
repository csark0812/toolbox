import { editDistance } from './distance.mjs'

/** The closest dictionary words to `word`: [{ word, distance, frequency }]. */
export function suggest(dictionary, word, { limit = 5, maxDistance = 2 } = {}) {
  const target = word.toLowerCase()
  const ranked = dictionary.map((entry) => ({
    word: entry.word,
    frequency: entry.frequency,
    distance: editDistance(target, entry.word.toLowerCase()),
  }))
  ranked.sort(
    (x, y) => x.distance - y.distance || y.frequency - x.frequency || x.word.localeCompare(y.word),
  )
  return ranked.filter((entry) => entry.distance <= maxDistance).slice(0, limit)
}
