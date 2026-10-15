/**
 * Runs `fn` over `items` with at most `limit` calls in flight. Resolves with one
 * `{ ok, value | error }` entry per item, in input order. Never rejects.
 */
export function mapLimit(items, limit, fn) {
  return new Promise((resolve) => {
    const results = new Array(items.length)
    let next = 0
    let active = 0
    let settled = 0
    const finish = () => {
      settled++
      if (settled === items.length) resolve(results)
    }
    const launch = () => {
      while (active < limit && next < items.length) {
        const index = next++
        active++
        Promise.resolve()
          .then(() => fn(items[index], index))
          .then(
            (value) => {
              results[index] = { ok: true, value }
              active--
              finish()
              launch()
            },
            (error) => {
              results[index] = { ok: false, error: error?.message ?? String(error) }
              finish()
            },
          )
      }
    }
    if (items.length === 0) resolve(results)
    else launch()
  })
}
