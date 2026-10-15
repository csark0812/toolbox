// Price cache with a time-to-live. ttlMs and now are milliseconds.

export function createCache({ ttlMs, now = () => Date.now() }) {
  const entries = new Map()
  return {
    get(sku) {
      const entry = entries.get(sku)
      if (!entry || entry.expiresAt <= now()) return undefined
      return entry.price
    },
    set(sku, price, ttl = ttlMs) {
      entries.set(sku, { price, expiresAt: now() + ttl })
    },
  }
}
