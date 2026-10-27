// Hidden acceptance for the Christmas tree invoices: heights the tagging app records in feet and
// inches (6'2", 5' 8", 7', curly quotes from the phone) are converted to centimetres, a tree of
// exactly 180 cm is in the £42 band, every invoice and the total come out right, and the tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
assert.equal(
  execFileSync(process.execPath, ['bin/invoices.mjs'], { cwd: dir, encoding: 'utf8' }),
  [
    'T101  Hartley     165 cm  tree £42.00  delivery £0.00  total £42.00',
    'T102  Pryce       120 cm  tree £30.00  delivery £0.00  total £30.00',
    'T103  Okafor      188 cm  tree £55.00  delivery £8.00  total £63.00',
    'T104  Bellamy     180 cm  tree £42.00  delivery £8.00  total £50.00',
    'T105  Quinn       173 cm  tree £42.00  delivery £0.00  total £42.00',
    'T106  Sutton      195 cm  tree £55.00  delivery £0.00  total £55.00',
    'T107  Adeyemi     175 cm  tree £42.00  delivery £8.00  total £50.00',
    'T108  Marsh       147 cm  tree £30.00  delivery £0.00  total £30.00',
    'T109  Doyle       175 cm  tree £42.00  delivery £0.00  total £42.00',
    'T110  Fenwick     213 cm  tree £55.00  delivery £8.00  total £63.00',
    'T111  Lindqvist   150 cm  tree £30.00  delivery £0.00  total £30.00',
    'T112  Rahman      152 cm  tree £42.00  delivery £0.00  total £42.00',
    'Total £539.00',
    '',
  ].join('\n'),
  'every tree gets its true height and price',
)
const { bandPrice, invoice } = await import(pathToFileURL(join(dir, 'src/invoice.mjs')).href)
const tree = (height) =>
  invoice({ tag: 'T9', customer: 'T', height, delivery: false, by: 'app' }).tree
assert.equal(tree("6'"), 5500, "6' is 183 cm")
assert.equal(tree('5\'0"'), 4200, '5\'0" is 152 cm')
assert.equal(tree('4\'11"'), 3000, '4\'11" is 150 cm or under')
assert.equal(tree('5’ 10”'), 4200, 'curly quotes with a space')
assert.equal(tree('6’1”'), 5500, 'curly quotes')
assert.equal(tree('160 cm'), 4200, 'centimetres typed in the app')
assert.equal(tree(185), 5500, 'office heights are centimetres')
const cm = invoice({ tag: 'T9', customer: 'T', height: '6\'2"', delivery: true, by: 'app' }).cm
assert.ok(Math.abs(cm - 187.96) < 0.5, `6'2" is about 188 cm, got ${cm}`)
assert.equal(bandPrice(180), 4200, '180 cm is in the middle band')
assert.equal(bandPrice(181), 5500, 'over 180 cm')
assert.equal(bandPrice(150), 3000, '150 cm is in the bottom band')
assert.equal(bandPrice(151), 4200, 'over 150 cm')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
