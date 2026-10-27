// Hidden acceptance for parseWeight and --roast-list: parseWeight reads grams, kilograms with up to
// three decimals and whole kilograms plus grams, in either case and with an optional single space,
// from 1 g to 5 kg, refusing anything else with a RangeError quoting the text and non-strings with
// a TypeError; the orders command lists each bean's roasted total for a date's open orders in the
// beans file's order, with the green weight worked out from the day's total (18% more, rounded up
// to the next 10 g), names unreadable lines and unknown beans on stderr with the order id, prints
// the nothing-to-roast line, exits 2 for a missing or invalid date, writes `roast: ` on every
// stderr line, and is unchanged without the option.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { parseWeight } = await import(pathToFileURL(join(dir, 'src/weight.mjs')).href)
for (const [text, grams] of [
  ['250g', 250],
  ['250 g', 250],
  ['250G', 250],
  ['1g', 1],
  ['5000g', 5000],
  ['1kg', 1000],
  ['1 KG', 1000],
  ['1Kg', 1000],
  ['5kg', 5000],
  ['0.5kg', 500],
  ['1.2kg', 1200],
  ['1.25KG', 1250],
  ['0.375kg', 375],
  ['0.001kg', 1],
  ['2.050kg', 2050],
  ['5.000kg', 5000],
  ['1kg 500g', 1500],
  ['1 kg 200 g', 1200],
  ['2kg 5g', 2005],
  ['4kg 999g', 4999],
  ['1KG 250G', 1250],
])
  assert.equal(parseWeight(text), grams, text)
for (const text of [
  '',
  '0g',
  '0kg',
  '0.0kg',
  '0.000kg',
  '5001g',
  '5.001kg',
  '6kg',
  '5kg 1g',
  '4kg 1000g',
  '1kg 1500g',
  '0250g',
  '00.5kg',
  '01kg',
  '1kg 050g',
  '.5kg',
  '1.kg',
  '1.2345kg',
  '1.5g',
  '250',
  'g',
  'kg',
  '250  g',
  ' 250g',
  '250g ',
  '250gm',
  '250 grams',
  '250kgs',
  '200g 1kg',
  '1kg 2kg',
  '1kg, 200g',
  '-250g',
  '+250g',
  '1e3g',
  '0x10g',
  '2.5e0kg',
  '1,5kg',
  '250g250g',
  'Infinityg',
  '１kg',
  '1lb',
])
  assert.throws(
    () => parseWeight(text),
    (error) => error instanceof RangeError && error.message.includes(text),
    `${JSON.stringify(text)} is refused with a RangeError quoting it`,
  )
for (const value of [250, null, undefined, ['250g'], {}, true])
  assert.throws(() => parseWeight(value), TypeError, `${String(value)} is refused with a TypeError`)

const run = (...args) =>
  spawnSync(process.execPath, ['bin/orders.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const listing = [
  'R301  2026-11-06  Corner Café    1kg 500g Huila, 250g Sidamo',
  'R302  2026-11-06  Ms Patel       250g Huila, 0.5kg Kiambu',
  'R303  2026-11-06  The Bike Shed  (cancelled) 5kg Huila, 2kg Sidamo',
  'R304  2026-11-06  Orla Byrne     250 g sidamo, 1.25KG Cerrado',
  'R305  2026-11-06  Hilltop Deli   5kg Cerrado, 500g Antigua, 6kg Kiambu',
  'R306  2026-11-06  Tom Reid       0250g Huila, 250g Huilla, 750g DECAF CAUCA',
  'R307  2026-11-06  Nadia Hassan   .5kg Antigua, 1kg Sidamo',
  'R308  2026-11-07  Corner Café    2kg Huila',
  'R309  2026-11-08  Ms Patel       (cancelled) 250g Kiambu',
]
const plain = run()
assert.equal(plain.stdout, listing.join('\n') + '\n', 'without the option the list is unchanged')
assert.equal(plain.status, 0)
const stderrLines = (result) => result.stderr.split('\n').filter((line) => line.trim())
for (const [date, lines, problems] of [
  [
    '2026-11-06',
    [
      'Huila  1.75 kg  2.07 kg',
      'Sidamo  1.5 kg  1.77 kg',
      'Cerrado  6.25 kg  7.38 kg',
      'Antigua  500 g  590 g',
      'Kiambu  500 g  590 g',
      'Decaf Cauca  750 g  890 g',
      'Orders: 6',
    ],
    [
      ['R305', '6kg'],
      ['R306', '0250g'],
      ['R306', 'Huilla'],
      ['R307', '.5kg'],
    ],
  ],
  ['2026-11-07', ['Huila  2 kg  2.36 kg', 'Orders: 1'], []],
  ['2026-11-08', ['Nothing to roast on 2026-11-08.'], []],
  ['2028-02-29', ['Nothing to roast on 2028-02-29.'], []],
]) {
  const result = run('--roast-list', date)
  assert.equal(result.status, 0, `--roast-list ${date} exits 0`)
  assert.equal(result.stdout, lines.join('\n') + '\n', `--roast-list ${date}`)
  const errors = stderrLines(result)
  for (const line of errors) assert.match(line, /^roast: /, 'stderr lines start with "roast: "')
  for (const [id, what] of problems)
    assert.ok(
      errors.some((line) => line.includes(id) && line.includes(what)),
      `${id}'s ${what} line is named on stderr`,
    )
  if (problems.length === 0) assert.equal(errors.length, 0, `nothing on stderr for ${date}`)
}
for (const args of [
  ['--roast-list'],
  ['--roast-list', '2026-11-31'],
  ['--roast-list', '2026-02-29'],
  ['--roast-list', '2026-13-01'],
  ['--roast-list', '2026-11-6'],
  ['--roast-list', '06/11/2026'],
  ['--roast-list', '2026-11-06T09:00'],
  ['--roast-list', ' 2026-11-06'],
  ['--roast-list', 'tomorrow'],
]) {
  const result = run(...args)
  assert.equal(result.status, 2, `${JSON.stringify(args)} exits 2`)
  assert.equal(result.stdout, '', `${JSON.stringify(args)} prints nothing on stdout`)
  const errors = stderrLines(result)
  assert.ok(errors.length > 0, `${JSON.stringify(args)} explains itself on stderr`)
  for (const line of errors) assert.match(line, /^roast: /, 'stderr lines start with "roast: "')
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
