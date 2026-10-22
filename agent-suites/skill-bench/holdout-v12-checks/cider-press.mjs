// Hidden acceptance for parseWeight() and --juice: kilograms with at most one decimal, whole pounds
// (`lb` or `lbs`) and whole stones with optional pounds under 14 after exactly one space, any case, at
// most one space before a unit, no leading zeros, above nothing and at most 500 kg, 454 g to the pound;
// bad text is a RangeError quoting it and non-strings a TypeError. The drops command totals each
// grower (matched ignoring case and surrounding spaces, shown as first written), gives juice at 6 l per
// 10 kg rounded down to 0.1 l on the grower's total, sorts by juice then name, totals the lines,
// reports unreadable tags on stderr, exits 2 for a missing or invalid date, writes `cider: ` on every
// stderr line, and is unchanged without the option.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { parseWeight } = await import(pathToFileURL(join(dir, 'src/weight.mjs')).href)

for (const [text, grams] of [
  ['42kg', 42000],
  ['42 kg', 42000],
  ['42KG', 42000],
  ['12.5Kg', 12500],
  ['12.5 kg', 12500],
  ['0.5kg', 500],
  ['0.1kg', 100],
  ['8.2kg', 8200],
  ['1.1 kg', 1100],
  ['500kg', 500000],
  ['499.9kg', 499900],
  ['1lb', 454],
  ['1 lbs', 454],
  ['30lbs', 13620],
  ['20 LB', 9080],
  ['11Lb', 4994],
  ['1101lb', 499854],
  ['1st', 6356],
  ['2 st', 12712],
  ['2ST', 12712],
  ['3st 4lb', 20884],
  ['3 st 4 lb', 20884],
  ['2st 13lb', 18614],
  ['78st 9lb', 499854],
]) {
  assert.equal(parseWeight(text), grams, `${JSON.stringify(text)} is ${grams} g`)
}
for (const text of [
  '0kg',
  '0.0kg',
  '0lb',
  '0st',
  '00.5kg',
  '05kg',
  '.5kg',
  '5.kg',
  '12.55kg',
  '24.35kg',
  '500.1kg',
  '501kg',
  '600 kg',
  '1102lb',
  '78st 10lb',
  '79st',
  '1.5lb',
  '1.5st',
  '3st 14lb',
  '1 st 14lb',
  '3st4lb',
  '3st  4lb',
  '3st 04lb',
  '3st 4kg',
  '42  kg',
  ' 42kg',
  '42kg ',
  '-5kg',
  '+5kg',
  '5e1kg',
  '0x10kg',
  '4,2kg',
  '42',
  'kg',
  '',
  '42 g',
  '42 kgs',
  '3 stone',
  '2 pounds',
  'Infinity kg',
  'NaN lb',
]) {
  assert.throws(
    () => parseWeight(text),
    (error) => error instanceof RangeError && error.message.includes(text),
    `${JSON.stringify(text)} is refused with a RangeError quoting it`,
  )
}
for (const value of [42, null, undefined, {}, ['42kg']])
  assert.throws(() => parseWeight(value), TypeError, `${String(value)} is refused with a TypeError`)

const run = (...args) =>
  spawnSync(process.execPath, ['bin/drops.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const listing = [
  'D01  2026-10-10  Ann Lee  Bramley  18 kg',
  'D02  2026-10-10  Bob Hart  Cox  2st',
  'D10  2026-10-17  Ann Lee  Bramley  42 kg',
  'D11  2026-10-17  ann lee  Russet  12.5Kg',
  'D12  2026-10-17  Bob Hart  Cox  30lbs',
  'D13  2026-10-17  Bob Hart  Cox  3st 4lb',
  'D14  2026-10-17  Cara Moss  Egremont Russet  11lb',
  'D15  2026-10-17  Cara Moss  Egremont Russet  0.5kg',
  'D16  2026-10-17  Dev Rao  Discovery  2st 13lb',
  'D17  2026-10-17  Eve Shaw  Worcester  24.35kg',
  'D18  2026-10-17  Hal Ng  Bramley  9 kg',
  'D19  2026-10-17  Ida Pye  Crab  20 LB',
  'D20  2026-10-17  Gus Bell  Mixed  600 kg',
  'D21  2026-10-17  Joe Kerr  Blenheim  1 st 14lb',
  'D22  2026-10-17  Kit Lowe  Mixed  500KG',
]
const plain = run()
assert.equal(plain.stdout, listing.join('\n') + '\n', 'without the option the list is unchanged')
assert.equal(plain.status, 0)
const stderrLines = (result) => result.stderr.split('\n').filter((line) => line.trim())

const day = run('--juice', '2026-10-17')
assert.equal(day.status, 0, '--juice 2026-10-17 exits 0')
assert.equal(
  day.stdout,
  [
    'Kit Lowe  500 kg  300.0 l',
    'Ann Lee  54.5 kg  32.7 l',
    'Bob Hart  34.504 kg  20.7 l',
    'Dev Rao  18.614 kg  11.1 l',
    'Hal Ng  9 kg  5.4 l',
    'Ida Pye  9.08 kg  5.4 l',
    'Cara Moss  5.494 kg  3.2 l',
    'Total  631.192 kg  378.5 l',
  ].join('\n') + '\n',
  '--juice 2026-10-17',
)
const errors = stderrLines(day)
for (const line of errors) assert.match(line, /^cider: /, 'stderr lines start with "cider: "')
for (const [id, weight] of [
  ['D17', '24.35kg'],
  ['D20', '600 kg'],
  ['D21', '1 st 14lb'],
])
  assert.ok(
    errors.some((line) => line.includes(id) && line.includes(weight)),
    `${id} and its weight ${weight} are on stderr`,
  )
for (const id of ['D10', 'D11', 'D12', 'D13', 'D16', 'D22'])
  assert.ok(!errors.some((line) => line.includes(id)), `${id} is not on stderr`)

const early = run('--juice', '2026-10-10')
assert.equal(early.status, 0)
assert.equal(
  early.stdout,
  ['Ann Lee  18 kg  10.8 l', 'Bob Hart  12.712 kg  7.6 l', 'Total  30.712 kg  18.4 l'].join('\n') +
    '\n',
  '--juice 2026-10-10',
)
assert.equal(stderrLines(early).length, 0, 'a clean day writes nothing on stderr')

const empty = run('--juice', '2026-10-24')
assert.equal(empty.status, 0)
assert.equal(empty.stdout, 'No pressing on 2026-10-24.\n', 'a day with no drop-offs')

for (const args of [
  ['--juice'],
  ['--juice', '2026-10-32'],
  ['--juice', '2026-02-29'],
  ['--juice', '2026-13-01'],
  ['--juice', '2026-10-7'],
  ['--juice', '17/10/2026'],
  ['--juice', '2026-10-17T10:00'],
  ['--juice', ' 2026-10-17'],
  ['--juice', 'saturday'],
]) {
  const result = run(...args)
  assert.equal(result.status, 2, `${JSON.stringify(args)} exits 2`)
  assert.equal(result.stdout, '', `${JSON.stringify(args)} prints nothing on stdout`)
  const lines = stderrLines(result)
  assert.ok(lines.length > 0, `${JSON.stringify(args)} explains itself on stderr`)
  for (const line of lines) assert.match(line, /^cider: /, 'stderr lines start with "cider: "')
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
