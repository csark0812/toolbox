// Hidden acceptance for the mirror sync hang: the pool keeps going after failures, never exceeds
// its limit, keeps input order, and the sync command prints its summary and exits cleanly.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { mapLimit } = await import(pathToFileURL(join(dir, 'src/pool.mjs')).href)
const within = (promise, ms, what) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${what} never settled`)), ms)),
  ])
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Every call fails: must still settle, with one error entry per item.
const allFail = await within(
  mapLimit([1, 2, 3, 4, 5, 6, 7], 2, async (n) => {
    await wait(2)
    throw new Error(`bad ${n}`)
  }),
  3000,
  'a run where every call fails',
)
assert.deepEqual(
  allFail.map((r) => [r.ok, r.error]),
  [1, 2, 3, 4, 5, 6, 7].map((n) => [false, `bad ${n}`]),
)

// Early failures must free their slots: concurrency returns to the limit afterwards.
let active = 0
let peak = 0
let peakAfterFailures = 0
let failures = 0
const mixed = await within(
  mapLimit(
    Array.from({ length: 12 }, (_, i) => i),
    3,
    async (i) => {
      active++
      peak = Math.max(peak, active)
      if (failures >= 3) peakAfterFailures = Math.max(peakAfterFailures, active)
      try {
        await wait(i < 3 ? 1 : 15)
        if (i < 3) {
          failures++
          throw new Error(`fail ${i}`)
        }
        return i * 10
      } finally {
        active--
      }
    },
  ),
  3000,
  'a run with early failures',
)
assert.equal(peak, 3, 'never more than the limit in flight')
assert.equal(peakAfterFailures, 3, 'failed calls release their slot')
assert.deepEqual(
  mixed.map((r) => (r.ok ? r.value : r.error)),
  ['fail 0', 'fail 1', 'fail 2', 30, 40, 50, 60, 70, 80, 90, 100, 110],
)
assert.deepEqual(await mapLimit([], 3, async () => 1), [])

// A synchronous throw from fn is a failure entry too, not a hang or a rejection.
const syncThrow = await within(
  mapLimit([1, 2, 3, 4], 1, (n) => {
    if (n % 2) throw new Error(`sync ${n}`)
    return n
  }),
  3000,
  'a run whose calls throw synchronously',
)
assert.deepEqual(
  syncThrow.map((r) => (r.ok ? r.value : r.error)),
  ['sync 1', 2, 'sync 3', 4],
)

const out = execFileSync(process.execPath, ['bin/sync.mjs'], {
  cwd: dir,
  encoding: 'utf8',
  timeout: 20000,
})
assert.match(out, /uploaded 8\/12/)
assert.match(out, /failed: hero\.jpg, vendor\.js, font-bold\.woff2, og-image\.png/)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
