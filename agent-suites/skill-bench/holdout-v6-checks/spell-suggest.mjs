// Hidden acceptance for the suggestion speed-up: the same suggestions as a plain edit-distance
// reference on random dictionaries (mixed case, ties, limits and distances), the caller's
// dictionary untouched, and the frozen timing script under target with the same work.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { suggest } = await import(pathToFileURL(join(dir, 'src/suggest.mjs')).href)

function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
  return d[a.length][b.length]
}
function reference(dictionary, word, { limit = 5, maxDistance = 2 } = {}) {
  return dictionary
    .map((e) => ({
      word: e.word,
      frequency: e.frequency,
      distance: distance(word.toLowerCase(), e.word.toLowerCase()),
    }))
    .filter((e) => e.distance <= maxDistance)
    .sort(
      (x, y) =>
        x.distance - y.distance || y.frequency - x.frequency || x.word.localeCompare(y.word),
    )
    .slice(0, limit)
}
let seed = 3
const next = () => (seed = (seed * 48271) % 2147483647)
const letters = 'abcdeAB'
const randomWord = (max) =>
  Array.from({ length: next() % (max + 1) }, () => letters[next() % letters.length]).join('')
for (let round = 0; round < 120; round++) {
  const seen = new Set()
  const dictionary = []
  for (let i = 0; i < next() % 60; i++) {
    const word = randomWord(7)
    if (!word || seen.has(word.toLowerCase())) continue
    seen.add(word.toLowerCase())
    dictionary.push({ word, frequency: 1 + (next() % 4) })
  }
  const frozen = JSON.stringify(dictionary)
  for (let q = 0; q < 8; q++) {
    const word = q === 0 && dictionary.length ? dictionary[0].word.toUpperCase() : randomWord(8)
    const options = [
      undefined,
      { limit: 1 + (next() % 8) },
      { maxDistance: next() % 4 },
      { limit: 3, maxDistance: 1 + (next() % 3) },
    ][q % 4]
    const got = suggest(dictionary, word, options).map((e) => [e.word, e.distance, e.frequency])
    const want = reference(dictionary, word, options).map((e) => [e.word, e.distance, e.frequency])
    assert.deepEqual(
      got,
      want,
      `round ${round}: ${JSON.stringify(word)} ${JSON.stringify(options)}`,
    )
  }
  assert.equal(JSON.stringify(dictionary), frozen, "the caller's dictionary is not changed")
}
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 110000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 158, 'the same number of suggestions')
assert.equal(perf.exact, 12, 'the same exact matches')
// Target is 15 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 35, `median ${perf.medianMs} ms is far above the 15 ms target`)
assert.equal(
  execFileSync(process.execPath, ['bin/suggest.mjs', 'Chior'], { cwd: dir, encoding: 'utf8' }),
  'choir (2)\n',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

// The work is committed on the feature branch; main is untouched.
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
