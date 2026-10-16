// Hidden acceptance for the router speed-up: the same match as the original rules on random route
// tables and requests (specificity segment by segment, registration order for ties, HEAD and `*`
// methods, wildcards, empty segments, trailing slashes, queries, undecodable params, routes whose
// first segment is a param), and the frozen timing script above target with the same work.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { createRouter } = await import(pathToFileURL(join(dir, 'src/router.mjs')).href)

function referenceRouter(routes) {
  const segs = (pattern) => pattern.split('/').filter(Boolean)
  const rank = (s) => (s === '*' ? 2 : s.startsWith(':') ? 1 : 0)
  const ordered = routes
    .map((route, index) => ({ route, index, ranks: segs(route.path).map(rank) }))
    .sort((a, b) => {
      for (let i = 0; i < Math.min(a.ranks.length, b.ranks.length); i++)
        if (a.ranks[i] !== b.ranks[i]) return a.ranks[i] - b.ranks[i]
      return a.index - b.index
    })
  return (method, url) => {
    let path = url.split('?')[0].split('#')[0]
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
    for (const { route } of ordered) {
      const ok =
        route.method === '*' ||
        route.method === method ||
        (method === 'HEAD' && route.method === 'GET')
      if (!ok) continue
      const names = []
      const source = segs(route.path)
        .map((s) => {
          if (s === '*') return names.push('*') && '/(.+)'
          if (s.startsWith(':')) return names.push(s.slice(1)) && '/([^/]+)'
          return `/${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
        })
        .join('')
      const found = new RegExp(`^${source || '/'}$`).exec(path)
      if (!found) continue
      try {
        const params = {}
        names.forEach((name, i) => (params[name] = decodeURIComponent(found[i + 1])))
        return { name: route.name, params }
      } catch {
        continue
      }
    }
    return null
  }
}
let seed = 99
const next = () => (seed = (seed * 48271) % 2147483647)
const pick = (list) => list[next() % list.length]
const literals = ['a', 'b', 'Ab', 'c.d']
for (let round = 0; round < 120; round++) {
  const routes = Array.from({ length: 1 + (next() % 14) }, (_, i) => {
    const length = next() % 4
    const parts = Array.from({ length }, (_, k) => {
      const r = next() % 6
      if (r === 0 && k === length - 1) return '*'
      if (r <= 2) return `:p${k}`
      return pick(literals)
    })
    return {
      method: pick(['GET', 'GET', 'POST', '*', 'PUT']),
      path: `/${parts.join('/')}`,
      name: `r${i}`,
    }
  })
  const router = createRouter(routes)
  const reference = referenceRouter(routes)
  for (let q = 0; q < 60; q++) {
    const parts = Array.from({ length: next() % 5 }, () =>
      pick([...literals, 'x%20y', '%E0%A4%A', '', 'zz', '7']),
    )
    let url = `/${parts.join('/')}`
    if (next() % 5 === 0) url += '/'
    if (next() % 6 === 0) url += '?q=1/2'
    if (next() % 9 === 0) url += '#top'
    const method = pick(['GET', 'HEAD', 'POST', 'PUT', 'DELETE'])
    assert.deepEqual(
      router.match(method, url),
      reference(method, url),
      `round ${round}: ${method} ${url} with ${JSON.stringify(routes)}`,
    )
  }
}
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 110000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 1198, 'the same requests are matched')
// Target is 1,000,000 requests a second; allow slack for a loaded machine.
assert.ok(
  perf.requestsPerSecond > 450000,
  `${perf.requestsPerSecond} requests/s is far below the 1,000,000 target`,
)
assert.equal(
  execFileSync(process.execPath, ['bin/match.mjs', 'GET', '/shops/7/orders/a%2Fb'], {
    cwd: dir,
    encoding: 'utf8',
  }),
  'showOrder {"shopId":"7","orderId":"a/b"}\n',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
