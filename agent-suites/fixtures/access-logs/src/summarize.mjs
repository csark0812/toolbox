import { ROUTES } from './routes.mjs'

/** One access-log line as { at, method, path, status, ms }, or null when it does not parse. */
export function parseLine(line) {
  const match = new RegExp('^(\\S+) ([A-Z]+) (\\S+) (\\d{3}) (\\d+)ms$').exec(line.trim())
  if (!match) return null
  const [, at, method, path, status, ms] = match
  return { at, method, path, status: Number(status), ms: Number(ms) }
}

/** The route name a request path belongs to. */
export function routeOf(path) {
  const bare = path.split('?')[0]
  for (const [pattern, name] of ROUTES) if (new RegExp(pattern).test(bare)) return name
  return 'other'
}

/** Nearest-rank percentile of an ascending list. */
function percentile(sorted, p) {
  const rank = Math.ceil((p / 100) * sorted.length)
  return sorted[Math.max(0, rank - 1)]
}

/** Per-route counts, 5xx errors and p50/p95 latency, busiest first. */
export function summarize(lines) {
  const buckets = []
  let malformed = 0
  for (const line of lines) {
    const entry = parseLine(line)
    if (!entry) {
      malformed++
      continue
    }
    const route = `${entry.method} ${routeOf(entry.path)}`
    let bucket = buckets.find((entry) => entry.route === route)
    if (!bucket) {
      bucket = { route, count: 0, errors: 0, durations: [], p50: 0, p95: 0 }
      buckets.push(bucket)
    }
    bucket.count++
    if (entry.status >= 500) bucket.errors++
    bucket.durations.push(entry.ms)
    const sorted = [...bucket.durations].sort((a, b) => a - b)
    bucket.p50 = percentile(sorted, 50)
    bucket.p95 = percentile(sorted, 95)
  }
  const routes = buckets
    .map(({ route, count, errors, p50, p95 }) => ({ route, count, errors, p50, p95 }))
    .sort((a, b) => b.count - a.count || (a.route < b.route ? -1 : a.route > b.route ? 1 : 0))
  return { routes, malformed }
}
