// Hidden acceptance for formatSize and --si: binary and decimal units, whole bytes below the first
// step, one decimal above it, rounding that carries into the next unit, the largest unit capped,
// RangeErrors that quote the value, and the listing's size column in both modes.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { formatSize } = await import(pathToFileURL(join(dir, 'src/size.mjs')).href)
const KiB = 1024
const binary = [
  [0, '0 B'],
  [1, '1 B'],
  [1023, '1023 B'],
  [1024, '1.0 KiB'],
  [1536, '1.5 KiB'],
  [10 * KiB + 102, '10.1 KiB'],
  [1048524, '1023.9 KiB'],
  [1048535, '1.0 MiB'],
  [1048576, '1.0 MiB'],
  [5 * KiB ** 3 + 300 * KiB ** 2, '5.3 GiB'],
  [KiB ** 4, '1.0 TiB'],
  [KiB ** 5, '1024.0 TiB'],
]
for (const [bytes, want] of binary) {
  assert.equal(formatSize(bytes), want, `formatSize(${bytes})`)
  assert.equal(formatSize(bytes, {}), want, `formatSize(${bytes}, {})`)
  assert.equal(formatSize(bytes, { si: false }), want, `formatSize(${bytes}, { si: false })`)
}
const decimal = [
  [0, '0 B'],
  [999, '999 B'],
  [1000, '1.0 kB'],
  [1023, '1.0 kB'],
  [999949, '999.9 kB'],
  [999960, '1.0 MB'],
  [1048576, '1.0 MB'],
  [17008001287, '17.0 GB'],
  [1e12, '1.0 TB'],
  [2.5e15, '2500.0 TB'],
]
for (const [bytes, want] of decimal)
  assert.equal(formatSize(bytes, { si: true }), want, `formatSize(${bytes}, { si: true })`)
for (const bad of [-1, 1.5, Number.NaN, 'abc']) {
  assert.throws(
    () => formatSize(bad),
    (error) => error instanceof RangeError && error.message.includes(String(bad)),
    `formatSize(${String(bad)}) throws a RangeError quoting it`,
  )
}

const usage = (...args) =>
  spawnSync(process.execPath, ['bin/usage.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const rows = (out) =>
  out
    .trimEnd()
    .split('\n')
    .map((line) => {
      const m = /^\s*(\d+(?:\.\d)? [kKMGTiB]+)\s{2,}(\S.*)$/.exec(line)
      assert.ok(m, `size and name on each line: ${JSON.stringify(line)}`)
      return [m[2], m[1]]
    })
assert.deepEqual(rows(usage().stdout), [
  ['projects/', '15.8 GiB'],
  ['archive/', '1.0 GiB'],
  ['fonts/', '1.2 MiB'],
  ['invoices.xlsx', '1.0 MiB'],
  ['todo.md', '0 B'],
])
assert.deepEqual(rows(usage('--si').stdout), [
  ['projects/', '17.0 GB'],
  ['archive/', '1.1 GB'],
  ['fonts/', '1.3 MB'],
  ['invoices.xlsx', '1.0 MB'],
  ['todo.md', '0 B'],
])
const bakery = [
  ['assets/', '163.5 MiB', '171.4 MB'],
  ['brief.pdf', '825.3 KiB', '845.1 kB'],
  ['notes.txt', '1023 B', '1.0 kB'],
]
assert.deepEqual(
  rows(usage('projects/bakery-rebrand').stdout),
  bakery.map(([n, b]) => [n, b]),
)
assert.deepEqual(
  rows(usage('--si', 'projects/bakery-rebrand').stdout),
  bakery.map(([n, , d]) => [n, d]),
)
assert.deepEqual(
  rows(usage('projects/bakery-rebrand', '--si').stdout),
  bakery.map(([n, , d]) => [n, d]),
)
const lines = usage().stdout.trimEnd().split('\n')
assert.equal(
  new Set(lines.map((line) => line.search(/\S\s{2,}\S/))).size,
  1,
  'sizes stay right-aligned',
)
const missing = usage('nowhere')
assert.equal(missing.status, 1)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
