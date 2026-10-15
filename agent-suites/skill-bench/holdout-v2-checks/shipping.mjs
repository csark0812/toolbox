// Hidden acceptance for the quote() signature change: one options object, the positional form
// gone, and every caller (cart, labels, CSV import, CLI) producing the same output as before.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const load = (file) => import(pathToFileURL(join(dir, 'src', file)).href)
const { quote } = await load('rates.mjs')
const { cartQuote } = await load('cart.mjs')
const { labelLine } = await load('labels.mjs')
const { quoteCsv } = await load('import.mjs')

const opts = (weightKg, length, width, height, zone, express) => ({
  weightKg,
  dimensionsCm: { length, width, height },
  zone,
  express,
})
assert.ok(quote.length <= 1, 'quote takes a single options object')
assert.equal(quote(opts(1.2, 20, 15, 10, 'A', false)), 675)
assert.equal(quote(opts(0.4, 60, 40, 40, 'B', true)), 6308)
assert.equal(quote(opts(7, 30, 30, 30, 'C', false)), 2815)
assert.equal(
  quote({ weightKg: 1.2, dimensionsCm: { length: 20, width: 15, height: 10 }, zone: 'A' }),
  675,
  'express defaults to false',
)
assert.throws(() => quote(opts(1, 10, 10, 10, 'Z', false)), RangeError)
let positional
try {
  positional = quote(1.2, 20, 15, 10, 'A', false)
} catch {
  positional = 'threw'
}
assert.ok(!Number.isFinite(positional), 'the positional signature is no longer accepted')

assert.equal(
  cartQuote({ items: [{ weightKg: 0.5, qty: 3 }], zone: 'B', shipping: 'standard' }),
  1055,
)
assert.equal(
  cartQuote({
    items: [{ weightKg: 1, qty: 1 }],
    box: { l: 50, w: 40, h: 30 },
    zone: 'C',
    shipping: 'express',
  }),
  Math.round((995 + 12 * 260) * 1.5),
)
assert.equal(
  labelLine({ kg: 2.2, l: 20, w: 20, h: 20, zone: 'B', express: true }),
  'ZONE B · 2.5 kg · EXPRESS · $17.18',
)
assert.equal(
  labelLine({ kg: 0.3, l: 10, w: 10, h: 10, zone: 'A', express: false }),
  'ZONE A · 0.5 kg · STANDARD · $5.55',
)
assert.deepEqual(
  quoteCsv(readFileSync(join(dir, 'data/carrier-export.csv'), 'utf8')),
  [675, 6308, 2815],
)
assert.deepEqual(
  quoteCsv('weight_kg,length_cm,width_cm,height_cm,zone,service\n3,10,10,10, A ,express\n'),
  [Math.round((495 + 360) * 1.5)],
)
const cli = (...args) =>
  execFileSync(process.execPath, ['bin/quote.mjs', ...args], { cwd: dir, encoding: 'utf8' }).trim()
assert.equal(cli('2.2', '20', '20', '20', 'B', 'express'), '$17.18')
assert.equal(cli('1.2', '20', '15', '10', 'A'), '$6.75')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
