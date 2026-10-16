// Hidden acceptance for parseDuration: only cases the request states unambiguously are pinned
// (units, combinations, spaces between parts, bare seconds, the rejections and the RangeError
// quoting the input), plus the --timeout wiring and the feature's own tests.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
/** True when `fn` throws anything. */
const rejects = (fn) => {
  try {
    fn()
  } catch {
    return true
  }
  return false
}
const { parseDuration } = await import(pathToFileURL(join(dir, 'src/duration.mjs')).href)
const ok = {
  '90s': 90000,
  '250ms': 250,
  '45m': 2700000,
  '2h': 7200000,
  '1d': 86400000,
  '1h30m': 5400000,
  '2m 15s': 135000,
  '1d 2h 3m 4s 5ms': 93784005,
  '1m500ms': 60500,
  '1h0m': 3600000,
  45: 45000,
}
for (const [text, ms] of Object.entries(ok))
  assert.equal(parseDuration(String(text)), ms, `parseDuration(${JSON.stringify(String(text))})`)
for (const text of [
  '',
  '5x',
  '1m1m',
  '30s1m',
  'ms1',
  '-5s',
  '1.5h',
  '-3',
  '2.5',
  'h',
  '10 parsecs',
])
  assert.throws(
    () => parseDuration(text),
    (error) => error instanceof RangeError && error.message.includes(text),
    `parseDuration(${JSON.stringify(text)}) throws a RangeError quoting the input`,
  )
const run = (...args) =>
  execFileSync(process.execPath, ['bin/run.mjs', ...args], { cwd: dir, encoding: 'utf8' })
assert.equal(run('send-digests', '--dry-run'), 'would run send-digests with a 30000ms timeout\n')
assert.equal(
  run('send-digests', '--timeout', '30', '--dry-run'),
  'would run send-digests with a 30000ms timeout\n',
)
assert.equal(
  run('reindex-search', '--timeout', '1m30s', '--dry-run'),
  'would run reindex-search with a 90000ms timeout\n',
)
assert.equal(
  run('--timeout', '250ms', 'send-digests', '--dry-run'),
  'would run send-digests with a 250ms timeout\n',
)
assert.ok(
  rejects(() => run('send-digests', '--timeout', '1x', '--dry-run')),
  'a bad --timeout is rejected',
)
const ownTests = readdirSync(join(dir, 'tests'))
  .filter((name) => name.endsWith('.mjs'))
  .map((name) => readFileSync(join(dir, 'tests', name), 'utf8'))
  .filter((text) => /parseDuration/.test(text))
assert.ok(ownTests.length > 0, 'the feature ships with its own tests')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
