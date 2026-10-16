// Hidden acceptance for the options-object migration: formatPrice takes (pence, options) with
// the same defaults and results, the positional form is gone (including the formatter table and
// the board settings), and invoices, export and board print exactly what they did.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { formatPrice } = await import(pathToFileURL(join(dir, 'src/money.mjs')).href)
assert.ok(formatPrice.length <= 2, 'formatPrice takes the amount and one options object')
assert.equal(formatPrice(1250), '£12.50')
assert.equal(formatPrice(1250, {}), '£12.50')
assert.equal(formatPrice(1250, { symbol: false }), '12.50 GBP')
assert.equal(formatPrice(1250, { currency: 'EUR' }), '€12.50')
assert.equal(formatPrice(1250, { currency: 'EUR', decimals: 0 }), '€13')
assert.equal(formatPrice(-1450), '£-14.50', 'refunds print as before')
assert.equal(formatPrice(5, { decimals: 1, symbol: false }), '0.1 GBP')
assert.throws(() => formatPrice(100, { currency: 'USD' }), RangeError)
let positional
try {
  positional = formatPrice(1250, 'EUR', true, 0)
} catch {
  positional = 'refused'
}
assert.notEqual(positional, '€13', 'the positional form is gone, not kept alongside')

const run = (script) =>
  execFileSync(process.execPath, [`bin/${script}.mjs`], { cwd: dir, encoding: 'utf8' })
assert.equal(
  run('invoices'),
  'Hill Farm Eggs (pitch A1)\n  Pitch                     \u00a332.00\n  Electric hook-up           \u00a36.50\n  Total                     \u00a338.50\n\nRiverside Bakery (pitch A2)\n  Pitch                     \u00a332.00\n  Gazebo hire               \u00a312.75\n  Total                     \u00a344.75\n\nMoor Cheese Co (pitch B4)\n  Double pitch              \u00a359.00\n  Rain refund, 3 Oct       \u00a3-14.50\n  Total                     \u00a344.50\n\nFromagerie Leclerc (pitch C1)\n  Pitch                     \u00a332.00\n  Electric hook-up           \u00a36.50\n  Late setup                 \u00a33.75\n  Total                     \u00a342.25\n',
  'invoices unchanged',
)
assert.equal(
  run('export'),
  'pitch,trader,items,total\nA1,Hill Farm Eggs,2,38.50 GBP\nA2,Riverside Bakery,2,44.75 GBP\nB4,Moor Cheese Co,2,44.50 GBP\nC1,Fromagerie Leclerc,3,42.25 GBP\n',
  'export unchanged',
)
assert.equal(
  run('board'),
  'March\u00e9 du Quai\n  A1  Hill Farm Eggs      \u20ac44\n  A2  Riverside Bakery    \u20ac51\n  B4  Moor Cheese Co      \u20ac51\n  C1  Fromagerie Leclerc  \u20ac49\n',
  'board unchanged',
)

const settings = JSON.parse(readFileSync(join(dir, 'data/settings.json'), 'utf8'))
assert.ok(
  !Array.isArray(settings.boardPrice),
  'the board settings no longer list positional arguments',
)
assert.doesNotMatch(
  readFileSync(join(dir, 'src/columns.mjs'), 'utf8'),
  /\[\s*formatPrice\s*,/,
  'the export columns no longer list positional arguments',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
