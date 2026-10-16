// Hidden acceptance for the access-log speed-up: identical summaries to the original algorithm on
// random logs (query strings, unknown and corrupt lines, count ties, outliers), and the frozen
// timing script under target.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { summarize } = await import(pathToFileURL(join(dir, 'src/summarize.mjs')).href)
const { ROUTES } = await import(pathToFileURL(join(dir, 'src/routes.mjs')).href)

function reference(lines) {
  const buckets = new Map()
  let malformed = 0
  for (const line of lines) {
    const m = /^(\S+) ([A-Z]+) (\S+) (\d{3}) (\d+)ms$/.exec(line.trim())
    if (!m) {
      malformed++
      continue
    }
    const bare = m[3].split('?')[0]
    const name = ROUTES.find(([pattern]) => new RegExp(pattern).test(bare))?.[1] ?? 'other'
    const route = `${m[2]} ${name}`
    const b = buckets.get(route) ?? { route, count: 0, errors: 0, ms: [] }
    buckets.set(route, b)
    b.count++
    if (Number(m[4]) >= 500) b.errors++
    b.ms.push(Number(m[5]))
  }
  const rank = (sorted, p) => sorted[Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)]
  return {
    routes: [...buckets.values()]
      .map(({ route, count, errors, ms }) => {
        const sorted = ms.sort((a, b) => a - b)
        return { route, count, errors, p50: rank(sorted, 50), p95: rank(sorted, 95) }
      })
      .sort((a, b) => b.count - a.count || (a.route < b.route ? -1 : a.route > b.route ? 1 : 0)),
    malformed,
  }
}
let seed = 99
const next = () => (seed = (seed * 48271) % 2147483647)
const paths = [
  '/',
  '/users',
  '/users/0',
  '/users/42?x=1',
  '/users/42/posts',
  '/users/7/avatar?size=2',
  '/posts/9/comments/3',
  '/tags/Upper',
  '/tags/a-b-1',
  '/messages/deadbeef',
  '/messages/deadbee',
  '/settings/',
  '/admin/',
  '/static/x?v=2',
  '/api/v1/',
  '/api/v2/x',
  '/nope',
  '/?q=1',
  '/health?',
]
for (let round = 0; round < 150; round++) {
  const lines = Array.from({ length: 1 + (next() % 60) }, () => {
    if (next() % 13 === 0)
      return ['', 'x', 't GET / 200 5', 't get / 200 5ms', '  t GET / 200 7ms  '][next() % 5]
    const method = ['GET', 'POST', 'PUT', 'DELETE'][next() % 4]
    const status = [200, 201, 404, 499, 500, 503][next() % 6]
    return `2026-10-01T00:00:00Z ${method} ${paths[next() % paths.length]} ${status} ${next() % 50}ms`
  })
  assert.deepEqual(summarize(lines), reference(lines), `round ${round}:\n${lines.join('\n')}`)
}
assert.deepEqual(summarize([]), { routes: [], malformed: 0 })
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 90000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 15989, 'same requests counted on the synthetic day')
// Target is 10 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 25, `median ${perf.medianMs} ms is far above the 10 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
