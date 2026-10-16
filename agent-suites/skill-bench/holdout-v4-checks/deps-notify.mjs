// Hidden acceptance for satisfies(): only cases the request states unambiguously are pinned
// (exact, caret including 0.x, tilde, comparisons, AND by spaces, OR by ||, *, pre-releases only
// matching their exact version, TypeError for malformed input), plus the outdated wiring and the
// feature's own tests.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { satisfies } = await import(pathToFileURL(join(dir, 'src/semver.mjs')).href)
const cases = [
  ['1.9.1', '^1.2.0', true],
  ['1.2.0', '^1.2.0', true],
  ['1.1.9', '^1.2.0', false],
  ['2.0.0', '^1.2.0', false],
  ['0.3.9', '^0.3.2', true],
  ['0.3.2', '^0.3.2', true],
  ['0.3.1', '^0.3.2', false],
  ['0.4.0', '^0.3.2', false],
  ['2.4.9', '~2.4.1', true],
  ['2.4.1', '~2.4.1', true],
  ['2.4.0', '~2.4.1', false],
  ['2.5.0', '~2.4.1', false],
  ['1.8.3', '>=1.0.0 <2.0.0', true],
  ['1.0.0', '>=1.0.0 <2.0.0', true],
  ['2.0.0', '>=1.0.0 <2.0.0', false],
  ['0.9.9', '>=1.0.0 <2.0.0', false],
  ['1.0.0', '>1.0.0', false],
  ['1.0.1', '>1.0.0', true],
  ['1.0.0', '<=1.0.0', true],
  ['1.0.1', '<=1.0.0', false],
  ['0.9.0', '<1.0.0', true],
  ['1.0.0', '<1.0.0', false],
  ['2.1.0', '2.1.0', true],
  ['2.1.1', '2.1.0', false],
  ['2.5.0', '^1.0.0 || ^2.0.0', true],
  ['1.0.0', '^1.0.0 || ^2.0.0', true],
  ['3.0.0', '^1.0.0 || ^2.0.0', false],
  ['7.0.0', '*', true],
  ['0.0.1', '*', true],
  ['3.0.0-rc.1', '*', false],
  ['3.0.0-rc.1', '^2.0.0 || ^3.0.0', false],
  ['3.0.0-rc.1', '>=1.0.0', false],
  ['3.0.0-rc.1', '3.0.0-rc.1', true],
  ['3.0.0', '3.0.0-rc.1', false],
]
for (const [version, range, want] of cases)
  assert.equal(satisfies(version, range), want, `satisfies(${version}, ${range})`)
for (const [version, range] of [
  ['1.0.0', 'banana'],
  ['1.0.0', '>>1.0.0'],
  ['1.0.0', '^'],
  ['1.0.0', '~abc'],
  ['x.y.z', '^1.0.0'],
  ['1.0', '*'],
])
  assert.throws(
    () => satisfies(version, range),
    TypeError,
    `satisfies(${version}, ${range}) throws`,
  )
const out = execFileSync(
  process.execPath,
  ['bin/outdated.mjs', 'data/manifest.json', 'data/registry.json'],
  {
    cwd: dir,
    encoding: 'utf8',
  },
)
const status = Object.fromEntries(
  out
    .trim()
    .split('\n')
    .map((line) => [line.split(/\s+/)[0], line.trim().split(/\s+/).at(-1)]),
)
assert.deepEqual(status, {
  'left-pad': 'current',
  'tiny-router': 'update',
  'date-kit': 'update',
  'csv-lite': 'current',
  colorette: 'current',
  'legacy-xml': 'update',
  anything: 'current',
})
const ownTests = readdirSync(join(dir, 'tests'))
  .filter((name) => name.endsWith('.mjs'))
  .map((name) => readFileSync(join(dir, 'tests', name), 'utf8'))
  .filter((text) => /satisfies/.test(text))
assert.ok(ownTests.length > 0, 'the feature ships with its own tests')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
