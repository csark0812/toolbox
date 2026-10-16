// A deterministic day of synthetic traffic: skewed toward a few hot routes, with query strings,
// unknown paths, slow outliers and a few corrupt lines.
const PATHS = [
  () => '/',
  () => '/health',
  () => '/login',
  (n) => `/search?q=term${n % 50}`,
  (n) => `/users/${n % 900}`,
  (n) => `/users/${n % 900}/posts?page=${n % 4}`,
  (n) => `/users/${n % 900}/followers`,
  (n) => `/posts/${n % 5000}`,
  (n) => `/posts/${n % 5000}/comments`,
  (n) => `/posts/${n % 5000}/comments/${n % 70}`,
  (n) => `/tags/topic-${n % 30}`,
  () => '/feed',
  () => '/feed/trending',
  () => '/notifications',
  (n) => `/messages/${(n * 2654435761).toString(16).padStart(8, '0').slice(-8)}`,
  (n) => `/settings/${['profile', 'privacy', 'email'][n % 3]}`,
  (n) => `/billing/invoices/${n % 300}`,
  (n) => `/admin/reports/${n % 9}`,
  (n) => `/static/app.${n % 5}.js`,
  (n) => `/api/v1/items/${n % 800}`,
  (n) => `/unknown/${n % 40}`,
]
const METHODS = ['GET', 'GET', 'GET', 'GET', 'POST', 'PUT', 'DELETE']

export function makeDay(count = 16000) {
  let seed = 20261001
  const next = () => (seed = (seed * 48271) % 2147483647)
  const lines = []
  for (let i = 0; i < count; i++) {
    const roll = next()
    if (roll % 997 === 0) {
      lines.push('### truncated line ###')
      continue
    }
    const pick = Math.min(
      PATHS.length - 1,
      Math.floor(((next() % 1000) / 1000) ** 2 * PATHS.length),
    )
    const path = PATHS[pick](next())
    const method = METHODS[next() % METHODS.length]
    const status = next() % 50 === 0 ? 503 : next() % 15 === 0 ? 404 : 200
    const ms = next() % 100 === 0 ? 800 + (next() % 4000) : 5 + (next() % 240)
    const at = new Date(Date.UTC(2026, 9, 1) + i * 2000).toISOString()
    lines.push(`${at} ${method} ${path} ${status} ${ms}ms`)
  }
  return lines
}
