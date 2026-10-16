// Hidden acceptance for parseDuration() and --length: only cases the request states are pinned
// (unit forms in h-m-s order with or without spaces, m:ss and h:mm:ss, a bare number as minutes,
// the rejections with the input quoted), plus the CLI wiring and the feature's own tests.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { parseDuration } = await import(pathToFileURL(join(dir, 'src/duration.mjs')).href)
const ok = [
  ['25m', 1500],
  ['90s', 90],
  ['2h', 7200],
  ['1h30m', 5400],
  ['1h 30m', 5400],
  ['2m30s', 150],
  ['1h0m5s', 3605],
  ['1h5s', 3605],
  ['1:30', 90],
  ['0:45', 45],
  ['12:05', 725],
  ['1:05:00', 3900],
  ['0:00:30', 30],
  ['45', 2700],
  ['120', 7200],
]
for (const [text, want] of ok)
  assert.equal(parseDuration(text), want, `parseDuration(${JSON.stringify(text)})`)
for (const text of [
  '',
  '0',
  '0m',
  '0:00',
  '-5m',
  '5x',
  '30m1h',
  '1h1h',
  '1:60',
  '1:5',
  'abc',
  '1:00:60',
  '10 minutes',
  'h',
])
  assert.throws(
    () => parseDuration(text),
    (error) => error instanceof RangeError && error.message.includes(text),
    `parseDuration(${JSON.stringify(text)}) throws a RangeError quoting the input`,
  )
const timer = (...args) =>
  spawnSync(process.execPath, ['bin/timer.mjs', 'start', '--task', 'Deep work', ...args], {
    cwd: dir,
    encoding: 'utf8',
  })
assert.equal(
  timer('--at', '09:00').stdout,
  'Deep work: 09:00 → 09:25\n',
  'default stays 25 minutes',
)
assert.equal(timer('--at', '09:00', '--length', '1h30m').stdout, 'Deep work: 09:00 → 10:30\n')
assert.equal(timer('--length', '50', '--at', '09:00').stdout, 'Deep work: 09:00 → 09:50\n')
assert.equal(timer('--at', '09:00', '--length', '90s').stdout, 'Deep work: 09:00 → 09:01:30\n')
assert.equal(
  timer('--at', '23:15', '--length', '1h').stdout,
  'Deep work: 23:15 → 00:15 (next day)\n',
)
const bad = timer('--at', '09:00', '--length', '1h1h')
assert.notEqual(bad.status, 0, 'a bad --length is refused')
assert.match(bad.stderr, /1h1h/, 'the error quotes the bad length')
assert.equal(bad.stdout, '')
const anyTests = readdirSync(join(dir, 'tests'))
  .map((name) => readFileSync(join(dir, 'tests', name), 'utf8'))
  .join('\n')
assert.match(anyTests, /parseDuration/, 'the parser ships with its own tests')
assert.match(anyTests, /--length/, 'the option ships with its own tests')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
