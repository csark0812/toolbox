// Development check for free-hut search: parseWeeks reads a week or a range of up to six weeks,
// with or without a W, and refuses the rest with a RangeError; --free lists the huts free for
// every week of the range (both ends included), reports none free on stderr with exit 1, bad
// ranges exit 2 with nothing on stdout, and the plain listing is unchanged.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { parseWeeks } = await import(pathToFileURL(join(dir, 'src/weeks.mjs')).href)
for (const [text, from, to] of [
  ['23', 23, 23],
  ['w23', 23, 23],
  ['W23', 23, 23],
  ['23-25', 23, 25],
  ['W23-w25', 23, 25],
  ['23 - 25', 23, 25],
  ['1-6', 1, 6],
  ['47-52', 47, 52],
  ['52', 52, 52],
])
  assert.deepEqual({ ...parseWeeks(text) }, { from, to }, JSON.stringify(text))
for (const bad of [
  '0',
  '53',
  '25-23',
  '20-26',
  '1-52',
  'week 3',
  '',
  '2.5',
  '-3',
  '23-',
  'x23',
  '23-25-27',
]) {
  assert.throws(() => parseWeeks(bad), RangeError, JSON.stringify(bad))
  if (bad.trim())
    assert.throws(
      () => parseWeeks(bad),
      (error) => error.message.includes(bad),
      `the message quotes ${JSON.stringify(bad)}`,
    )
}
const cli = (...args) =>
  spawnSync(process.execPath, ['bin/huts.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const huts = (stdout) =>
  stdout
    .split('\n')
    .map((line) => line.match(/^Hut (\d+)$/)?.[1])
    .filter(Boolean)
    .map(Number)
for (const [range, free] of [
  ['24-25', [5]],
  ['w27', [2, 3, 4, 5]],
  ['26', [1, 3, 4, 5]],
  ['30', [1, 2, 3, 4]],
  ['31-36', [1, 2, 3, 4, 5]],
  ['W22 - 23', [3, 4]],
]) {
  const result = cli('--free', range)
  assert.deepEqual(huts(result.stdout), free, `--free ${range}: ${result.stdout}`)
  assert.equal(result.status, 0, `--free ${range}`)
}
const none = cli('--free', '20-25')
assert.equal(none.status, 1, 'no hut free exits 1')
assert.equal(huts(none.stdout).length, 0, 'no hut is listed when none is free')
assert.notEqual(none.stderr.trim(), '', 'no hut free is said on stderr')
for (const bad of [
  ['--free', '53'],
  ['--free'],
  ['--free', '20-26'],
  ['--free', 'july'],
  ['--free', '25-23'],
]) {
  const result = cli(...bad)
  assert.equal(result.status, 2, bad.join(' '))
  assert.equal(result.stdout, '', bad.join(' '))
  assert.notEqual(result.stderr.trim(), '', bad.join(' '))
}
const plain = cli()
assert.equal(
  plain.stdout,
  'Hut 1: Patel wk23-24, Okafor wk27\nHut 2: Lund wk20-26\nHut 3: Ng wk25\nHut 4: Quinn wk24\nHut 5: Moreau wk22-23, Silva wk28-30\n',
)
assert.equal(plain.stderr, '', 'the plain listing writes nothing to stderr')
assert.equal(spawnSync(process.execPath, ['--test'], { cwd: dir }).status, 0, 'tests pass')
