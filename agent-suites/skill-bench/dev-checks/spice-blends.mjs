// Development check for the jar scaling: toTeaspoons reads every written form and refuses the
// rest with a RangeError, --jars scales each spice, unreadable amounts go to stderr, bad counts
// exit 2 with nothing on stdout, and the plain recipe is unchanged.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { toTeaspoons } = await import(pathToFileURL(join(dir, 'src/amounts.mjs')).href)
for (const [text, tsp] of [
  ['1 tsp', 1],
  ['1 1/2 tsp', 1.5],
  ['3/4 tsp', 0.75],
  ['0.5 tsp', 0.5],
  ['2 tbsp', 6],
  ['1 TBSP', 3],
  ['1 Tbsp', 3],
  ['1 1/4 tsp', 1.25],
])
  assert.equal(toTeaspoons(text), tsp, text)
for (const bad of ['a pinch', '', 'tsp', '1', '1/0 tsp', '2 cups', '1 1/2', '-1 tsp'])
  assert.throws(() => toTeaspoons(bad), RangeError, JSON.stringify(bad))
const cli = (...args) =>
  spawnSync(process.execPath, ['bin/blend.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const amounts = (stdout) =>
  Object.fromEntries(
    stdout
      .split('\n')
      .map((line) => line.match(/^\s+([\d.]+) tsp (.+)$/))
      .filter(Boolean)
      .map(([, n, spice]) => [spice, Number(n)]),
  )
const three = cli('ras', 'el', 'hanout', '--jars', '3')
assert.deepEqual(amounts(three.stdout), {
  cumin: 4.5,
  ginger: 3,
  cinnamon: 2.25,
  turmeric: 9,
  cloves: 0.75,
})
const chili = cli('chili', 'crunch', 'base', '--jars', '2')
assert.deepEqual(amounts(chili.stdout), { 'chili flakes': 12, 'sichuan pepper': 1, sesame: 6 })
assert.match(chili.stderr, /star anise/)
assert.doesNotMatch(chili.stdout, /star anise/)
for (const bad of [
  ['--jars', '0'],
  ['--jars', '51'],
  ['--jars', 'two'],
  ['--jars'],
  ['--jars', '1.5'],
]) {
  const result = cli('pumpkin', 'spice', ...bad)
  assert.equal(result.status, 2, bad.join(' '))
  assert.equal(result.stdout, '', bad.join(' '))
  assert.notEqual(result.stderr.trim(), '', bad.join(' '))
}
assert.equal(
  cli('ras', 'el', 'hanout').stdout,
  'ras el hanout\n  1 1/2 tsp cumin\n  1 tsp ginger\n  3/4 tsp cinnamon\n  1 TBSP turmeric\n  1/4 tsp cloves\n',
)
assert.equal(spawnSync(process.execPath, ['--test'], { cwd: dir }).status, 0, 'tests pass')
