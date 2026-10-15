// Caches the fetched feed and refreshes it once it is older than `refreshMs`.
export const REFRESH_MS = 10 * 60 * 1000

export function createFeedCache(fetchFeed, { refreshMs = REFRESH_MS, now = Date.now } = {}) {
  let entry = null
  return {
    async items() {
      if (!entry || now() - entry.fetchedAt >= refreshMs) {
        entry = { fetchedAt: now(), items: await fetchFeed() }
      }
      return entry
    },
  }
}
