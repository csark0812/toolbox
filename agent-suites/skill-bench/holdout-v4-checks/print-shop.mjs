// Hidden acceptance for parsePages(): only cases the request states unambiguously are pinned
// (single pages, closed and open ranges, overlaps, ordering, blank means all, RangeError naming
// the offending part), plus the --pages wiring and the feature's own tests.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { parsePages } = await import(pathToFileURL(join(dir, 'src/pages.mjs')).href)
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
const ok = [
  ['1-3, 5, 8-', 12, [1, 2, 3, 5, ...range(8, 12)]],
  ['5,1,3', 5, [1, 3, 5]],
  ['2-4,3-5', 6, [2, 3, 4, 5]],
  ['4, 4, 2-4', 6, [2, 3, 4]],
  ['7', 7, [7]],
  ['4-4', 5, [4]],
  ['-3', 10, [1, 2, 3]],
  ['9-', 9, [9]],
  ['', 3, [1, 2, 3]],
  ['   ', 3, [1, 2, 3]],
  ['1-12', 12, range(1, 12)],
]
for (const [spec, count, want] of ok)
  assert.deepEqual(
    [...parsePages(spec, count)],
    want,
    `parsePages(${JSON.stringify(spec)}, ${count})`,
  )
for (const [spec, count, part] of [
  ['0', 5, '0'],
  ['13', 12, '13'],
  ['5-2', 9, '5-2'],
  ['abc', 9, 'abc'],
  ['1-3, x', 9, 'x'],
  ['2-20', 12, '20'],
  ['1.5', 9, '1.5'],
])
  assert.throws(
    () => parsePages(spec, count),
    (error) => error instanceof RangeError && error.message.includes(part),
    `parsePages(${JSON.stringify(spec)}, ${count}) throws a RangeError naming ${part}`,
  )
const print = (...args) =>
  spawnSync(process.execPath, ['bin/print.mjs', 'data/thesis.json', ...args], {
    cwd: dir,
    encoding: 'utf8',
  })
assert.equal(
  print().stdout,
  'title: Tidal energy in the Irish Sea\npages: 1,2,3,4,5,6,7,8,9,10,11,12\ncopies: 1\nsheets: 12\nprice: $1.08\n',
  'without --pages every page prints, as before',
)
assert.equal(
  print('--pages', '1-3,5').stdout,
  'title: Tidal energy in the Irish Sea\npages: 1,2,3,5\ncopies: 1\nsheets: 4\nprice: $0.36\n',
)
assert.equal(
  print('--pages', '10-', '--duplex', '--copies', '2').stdout,
  'title: Tidal energy in the Irish Sea\npages: 10,11,12\ncopies: 2\nsheets: 4\nprice: $0.54\n',
)
const bad = print('--pages', '13')
assert.notEqual(bad.status, 0, 'a page past the end is rejected')
assert.match(bad.stderr, /13/, 'the error names the bad page')
const ownTests = readdirSync(join(dir, 'tests'))
  .filter((name) => name.endsWith('.mjs'))
  .map((name) => readFileSync(join(dir, 'tests', name), 'utf8'))
  .filter((text) => /parsePages/.test(text))
assert.ok(ownTests.length > 0, 'the feature ships with its own tests')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
