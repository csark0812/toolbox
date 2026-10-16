/** A small keyed cache with explicit invalidation. */
export function createCache() {
  const entries = new Map()
  return {
    get: (key) => entries.get(key),
    has: (key) => entries.has(key),
    set: (key, value) => void entries.set(key, value),
    delete: (key) => entries.delete(key),
    clear: () => entries.clear(),
    get size() {
      return entries.size
    },
  }
}
