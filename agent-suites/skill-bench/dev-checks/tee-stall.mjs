// Development check for size lookups: sizeRange reads one size or a range from XS to XXL (2XL
// allowed) and refuses the rest with a RangeError, --sizes lists only in-stock sizes in the range,
// unknown sizes go to stderr, an empty result exits 1, bad ranges exit 2 with nothing on stdout,
// and the plain stock list is unchanged.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { sizeRange } = await import(pathToFileURL(join(dir, 'src/sizes.mjs')).href)
for (const [text, sizes] of [
  ['M', ['M']],
  ['xs', ['XS']],
  ['S-XL', ['S', 'M', 'L', 'XL']],
  ['s-xl', ['S', 'M', 'L', 'XL']],
  ['L - XXL', ['L', 'XL', 'XXL']],
  ['XS-2XL', ['XS', 'S', 'M', 'L', 'XL', 'XXL']],
  ['2xl', ['XXL']],
  ['XL-xl', ['XL']],
  [' M ', ['M']],
])
  assert.deepEqual([...sizeRange(text)], sizes, JSON.stringify(text))
for (const bad of ['XL-S', 'XXXL', '3XL', '', 'Medium', 'S-', '-M', 'S-M-L', 'S,M', 'X']) {
  assert.throws(() => sizeRange(bad), RangeError, JSON.stringify(bad))
  if (bad.trim())
    assert.throws(
      () => sizeRange(bad),
      (error) => error.message.includes(bad),
      `the message includes ${JSON.stringify(bad)}`,
    )
}
const cli = (...args) =>
  spawnSync(process.execPath, ['bin/stock.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const lines = (stdout) => stdout.split('\n').filter((line) => /^\w+: /.test(line))
for (const [range, expected] of [
  ['S-L', ['Lighthouse: S 4, L 2', 'Kraken: M 3']],
  ['xl-2xl', ['Kraken: XXL 2']],
  ['XS', ['Gull: XS 2']],
  ['M', ['Kraken: M 3']],
  ['XS-2XL', ['Lighthouse: S 4, L 2', 'Kraken: M 3, XXL 2', 'Gull: XS 2']],
]) {
  const result = cli('--sizes', range)
  assert.deepEqual(lines(result.stdout), expected, `--sizes ${range}: ${result.stdout}`)
  assert.match(result.stderr, /Medium/, `--sizes ${range} names the unknown size on stderr`)
}
const none = cli('--sizes', 'XL')
assert.equal(none.status, 1, 'nothing in stock exits 1')
assert.deepEqual(lines(none.stdout), [], 'nothing is listed when nothing is in stock')
assert.notEqual(none.stderr.trim(), '', 'nothing in stock is said on stderr')
for (const bad of [['--sizes', 'XL-S'], ['--sizes'], ['--sizes', 'huge'], ['--sizes', '3XL']]) {
  const result = cli(...bad)
  assert.equal(result.status, 2, bad.join(' '))
  assert.equal(result.stdout, '', bad.join(' '))
  assert.notEqual(result.stderr.trim(), '', bad.join(' '))
}
const plain = cli()
assert.equal(
  plain.stdout,
  'Lighthouse: XS 0, S 4, M 0, L 2, XL 0\nKraken: S 0, M 3, L 0, XXL 2\nPuffin: M 0, Medium 5, XL 0\nGull: XS 2, XL 0\n',
)
assert.equal(plain.stderr, '', 'the plain list writes nothing to stderr')
assert.equal(plain.status, 0)
assert.equal(spawnSync(process.execPath, ['--test'], { cwd: dir }).status, 0, 'tests pass')
