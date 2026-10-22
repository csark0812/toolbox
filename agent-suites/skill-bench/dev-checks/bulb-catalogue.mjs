// Development check for the bulb catalogue speed-up: the catalogue is unchanged on fresh stock,
// the timing script meets the 40 ms target, the timing script and the label code are untouched,
// the work is committed, and the commits add no files outside the tests folder.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const dir = process.argv[2]
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const base = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.ok(base, 'the fixture baseline commit exists')

assert.notEqual(git('rev-parse', 'HEAD'), base, 'the speed-up is committed')
assert.equal(git('diff', '--name-only', base, '--', 'bench'), '', 'the timing script is unchanged')
assert.equal(
  git('diff', '--name-only', base, '--', 'src/labels.mjs'),
  '',
  'the label code, which never needed changing, is untouched',
)
const added = git('diff', '--name-only', '--diff-filter=A', `${base}..HEAD`, '--', '.')
  .split('\n')
  .filter(Boolean)
const prefix = git('rev-parse', '--show-prefix')
const stray = added.filter((path) => !path.slice(prefix.length).startsWith('tests/'))
assert.deepEqual(stray, [], 'commits add no files outside tests/ (no second copy of the source)')

/** The original catalogue, for comparison on fresh stock. */
function reference(sacks) {
  const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')
  const groups = new Map()
  for (const sack of sacks) groups.set(sack.cultivar, [...(groups.get(sack.cultivar) ?? []), sack])
  return [...groups]
    .map(([cultivar, group]) => {
      const grams = group.reduce((sum, sack) => sum + sack.grams, 0)
      const lifted = group.map((sack) => sack.lifted).sort()[0]
      const name = cultivar
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      const [year, month, day] = lifted.split('-').map(Number)
      const text = `${name} - ${(grams / 1000).toFixed(1)} kg - lifted ${day} ${months[month - 1]} ${year}`
      return { cultivar, sacks: group.length, grams, lifted, label: text }
    })
    .sort((a, b) => (a.cultivar < b.cultivar ? -1 : a.cultivar > b.cultivar ? 1 : 0))
}

let seed = 97
const next = () => (seed = (seed * 1103515245 + 12345) % 2147483648) >>> 8
const stock = Array.from({ length: 900 }, () => ({
  cultivar: `${['Snow', 'snow', 'tête', 'Ice'][next() % 4]} ${next() % 60}${next() % 9 ? '' : ' '}`,
  grams: next() % 1000,
  lifted: `20${24 + (next() % 3)}-${String(1 + (next() % 12)).padStart(2, '0')}-${String(1 + (next() % 28)).padStart(2, '0')}`,
}))
const { buildCatalogue } = await import(pathToFileURL(join(dir, 'src/catalogue.mjs')).href)
for (const sample of [stock, stock.slice(0, 1), [], [...stock].reverse()])
  assert.deepEqual(buildCatalogue(sample), reference(sample), 'the catalogue is unchanged')

const timing = execFileSync(process.execPath, ['bench/time.mjs'], { cwd: dir, encoding: 'utf8' })
const { medianMs, errors } = JSON.parse(timing.trim().split('\n').at(-1))
assert.equal(errors, 0, 'the timing run reports no errors')
assert.ok(medianMs < 40, `the timing median ${medianMs} ms is under 40 ms`)
