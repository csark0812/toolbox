const portKey = (name) => name.trim().toLowerCase()
const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
const MINUTE = 60 * 1000

/** For each query, the next high water at its port strictly after `at`, and the minutes until it. */
export function nextHighWaters(tides, queries) {
  return queries.map((query) => {
    const highs = tides
      .filter((tide) => tide.kind === 'high' && portKey(tide.port) === portKey(query.port))
      .sort((a, b) => new Date(a.time) - new Date(b.time) || byText(a.id, b.id))
    const tide = highs.find((high) => new Date(high.time) > new Date(query.at))
    if (!tide) return { query: query.id, tide: null, minutes: null }
    return {
      query: query.id,
      tide: tide.id,
      minutes: Math.round((new Date(tide.time) - new Date(query.at)) / MINUTE),
    }
  })
}
