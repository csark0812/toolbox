// Hidden acceptance for wrap() and --width: greedy wrapping in code points, collapsed spaces and
// tabs, kept line breaks, long words cut on their own line, RangeErrors for bad widths, and the
// receipt laid out at 24, 32 and 48 columns with bad widths refused.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { wrap } = await import(pathToFileURL(join(dir, 'src/wrap.mjs')).href)
const cases = [
  ['the quick brown fox', 10, ['the quick', 'brown fox']],
  ['a  b\tc', 10, ['a b c']],
  ['  leading and trailing  ', 30, ['leading and trailing']],
  ['abcdefghijkl', 5, ['abcde', 'fghij', 'kl']],
  ['xy abcdefghijkl z', 5, ['xy', 'abcde', 'fghij', 'kl z']],
  ['exactly10c', 10, ['exactly10c']],
  ['ab cd', 5, ['ab cd']],
  ['ab cde', 5, ['ab', 'cde']],
  ['', 10, []],
  ['   ', 10, []],
  ['one\ntwo', 10, ['one', 'two']],
  ['one\n\ntwo', 10, ['one', '', 'two']],
  ['café ☕ crème', 6, ['café ☕', 'crème']],
  ['😀😀😀', 2, ['😀😀', '😀']],
  ['x', 1, ['x']],
]
for (const [text, width, want] of cases)
  assert.deepEqual(wrap(text, width), want, `wrap(${JSON.stringify(text)}, ${width})`)
for (const width of [0, -1, 2.5, Number.NaN, '10'])
  assert.throws(() => wrap('text', width), RangeError, `width ${String(width)} is refused`)

const EXPECTED = {
  32: [
    '      Larch Lane Farm Shop',
    'Sale 1042             2026-10-16',
    '--------------------------------',
    '2 x Sourdough loaf         £7.00',
    '1 x Free-range eggs,       £2.40',
    'half dozen',
    '1 x Wheelbarrow inner     £12.50',
    'tube 4.80/4.00-8',
    'heavy-duty',
    '1 x Café crème coffee      £6.95',
    'beans ☕ 250g',
    '6 x Apples                 £2.70',
    '--------------------------------',
    'TOTAL                     £31.55',
    'Thank you for shopping local!',
    'Returns within 14 days with this',
    'receipt.',
    'Eggs are back every Saturday.',
  ],
  24: [
    '  Larch Lane Farm Shop',
    'Sale 1042     2026-10-16',
    '------------------------',
    '2 x Sourdough      £7.00',
    'loaf',
    '1 x Free-range     £2.40',
    'eggs, half',
    'dozen',
    '1 x Wheelbarrow   £12.50',
    'inner tube',
    '4.80/4.00-8',
    'heavy-duty',
    '1 x Café crème     £6.95',
    'coffee beans ☕',
    '250g',
    '6 x Apples         £2.70',
    '------------------------',
    'TOTAL             £31.55',
    'Thank you for shopping',
    'local! Returns within 14',
    'days with this receipt.',
    'Eggs are back every',
    'Saturday.',
  ],
  48: [
    '              Larch Lane Farm Shop',
    'Sale 1042                             2026-10-16',
    '------------------------------------------------',
    '2 x Sourdough loaf                         £7.00',
    '1 x Free-range eggs, half dozen            £2.40',
    '1 x Wheelbarrow inner tube 4.80/4.00-8    £12.50',
    'heavy-duty',
    '1 x Café crème coffee beans ☕ 250g         £6.95',
    '6 x Apples                                 £2.70',
    '------------------------------------------------',
    'TOTAL                                     £31.55',
    'Thank you for shopping local! Returns within 14',
    'days with this receipt.',
    'Eggs are back every Saturday.',
  ],
}
const receipt = (...args) =>
  spawnSync(process.execPath, ['bin/receipt.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const lines = (out) =>
  out
    .split('\n')
    .slice(0, -1)
    .map((line) => line.trimEnd())
assert.deepEqual(lines(receipt('data/sale-1042.json').stdout), EXPECTED[32], 'default width 32')
for (const width of [32, 24, 48]) {
  assert.deepEqual(
    lines(receipt('data/sale-1042.json', '--width', String(width)).stdout),
    EXPECTED[width],
    `--width ${width}`,
  )
}
assert.deepEqual(
  lines(receipt('--width', '24', 'data/sale-1042.json').stdout),
  EXPECTED[24],
  '--width before the file',
)
for (const bad of ['23', '49', 'wide', '30.5', '']) {
  const run = receipt('data/sale-1042.json', '--width', bad)
  assert.equal(run.status, 2, `--width ${JSON.stringify(bad)} exits 2`)
  assert.equal(run.stdout, '', `--width ${JSON.stringify(bad)} prints no receipt`)
  assert.ok(run.stderr.trim(), `--width ${JSON.stringify(bad)} explains on stderr`)
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
