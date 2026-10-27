/** Badge records from the group's export. */
export function loadAwards(text) {
  return JSON.parse(text).map((award) => ({ ...award, lvl: Number(award.lvl) }))
}

/** Sorts a copy of `list` by each key in turn, descending for numbers and ascending for text. */
export function sortBy(list, ...keys) {
  return [...list].sort((a, b) => {
    for (const key of keys) {
      const order =
        typeof a[key] === 'number' ? b[key] - a[key] : String(a[key]).localeCompare(String(b[key]))
      if (order) return order
    }
    return 0
  })
}

/** One scout's awards, highest stage first, then by badge name. */
export function awardsFor(awards, scout) {
  return sortBy(
    awards.filter((award) => award.scout === scout),
    'lvl',
    'nm',
  )
}

/** The highest stage each scout holds of a badge. */
export function highestStages(awards, bc) {
  const best = new Map()
  for (const award of awards)
    if (award.bc === bc) best.set(award.scout, Math.max(best.get(award.scout) ?? 0, award.lvl))
  return best
}
