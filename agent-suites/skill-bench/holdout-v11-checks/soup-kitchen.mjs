// Hidden acceptance for parseVolume and --servings: parseVolume reads whole millilitres, litres with
// up to two decimals and whole pints (568 ml, `pint` for one and `pints` otherwise), in any case and
// with an optional single space, from 1 ml to 50 l, refusing anything else with a RangeError quoting
// the text and non-strings with a TypeError; the batches command lists each soup's served volume for a
// date in the soups file's order with the full 300 ml bowls left after 5% is lost worked out from the
// day's total, names unreadable pots and unknown soups on stderr with the batch id, prints the
// nothing-to-serve line, exits 2 for a missing or invalid date, writes `soup: ` on every stderr line,
// and is unchanged without the option.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { parseVolume } = await import(pathToFileURL(join(dir, 'src/volume.mjs')).href)
for (const [text, ml] of [
  ['750ml', 750],
  ['750 ml', 750],
  ['750ML', 750],
  ['750mL', 750],
  ['1ml', 1],
  ['50000ml', 50000],
  ['20l', 20000],
  ['20 L', 20000],
  ['18.5 l', 18500],
  ['0.75l', 750],
  ['0.05l', 50],
  ['0.01l', 10],
  ['2.01L', 2010],
  ['1.13l', 1130],
  ['4.35l', 4350],
  ['9.25l', 9250],
  ['50l', 50000],
  ['50.00l', 50000],
  ['1 pint', 568],
  ['1pint', 568],
  ['1 PINT', 568],
  ['2 pints', 1136],
  ['5 Pints', 2840],
  ['10 pints', 5680],
  ['88 pints', 49984],
])
  assert.equal(parseVolume(text), ml, text)
for (const text of [
  '',
  '0ml',
  '0l',
  '0.0l',
  '0.00l',
  '0 pints',
  '50001ml',
  '50.01l',
  '51l',
  '89 pints',
  '020l',
  '00.5l',
  '0750ml',
  '01 pint',
  '.5l',
  '5.l',
  '1.005l',
  '1.5ml',
  '1.5 pints',
  '2 pint',
  '1 pints',
  '20',
  'l',
  'ml',
  'pints',
  '20  l',
  ' 20l',
  '20l ',
  '20 litres',
  '20lt',
  '20ltr',
  '20 l 500ml',
  '-20l',
  '+20l',
  '2e1l',
  '0x10l',
  '1,5l',
  '20l20l',
  'Infinityl',
  '２0l',
  '1 quart',
  '1 gallon',
])
  assert.throws(
    () => parseVolume(text),
    (error) => error instanceof RangeError && error.message.includes(text),
    `${JSON.stringify(text)} is refused with a RangeError quoting it`,
  )
for (const value of [750, null, undefined, ['20l'], {}, true])
  assert.throws(() => parseVolume(value), TypeError, `${String(value)} is refused with a TypeError`)

const run = (...args) =>
  spawnSync(process.execPath, ['bin/batches.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const listing = [
  'S41  2026-11-03  Leek and Potato       20l, 18.5 l, 5 pints',
  'S42  2026-11-03  carrot and coriander  750ml, 2.01L',
  'S43  2026-11-03  Tomato                (burnt) 40l',
  'S44  2026-11-03  Tomato                0.05l, 1 PINT',
  'S45  2026-11-03  Leek and Potato       9.25l, 020l, 2 pint',
  'S46  2026-11-03  Pea and Ham           15l',
  'S47  2026-11-03  Lentil                51l, 5 L',
  'S48  2026-11-10  Minestrone            12l',
  'S49  2026-11-10  Carrot and Coriander  250ml',
  'S50  2026-11-17  Carrot and Coriander  (burnt) 6l',
]
const plain = run()
assert.equal(plain.stdout, listing.join('\n') + '\n', 'without the option the list is unchanged')
assert.equal(plain.status, 0)
const stderrLines = (result) => result.stderr.split('\n').filter((line) => line.trim())
for (const [date, lines, problems] of [
  [
    '2026-11-03',
    [
      'Leek and Potato  50.59 l  160 bowls',
      'Carrot and Coriander  2.76 l  8 bowls',
      'Tomato  618 ml  1 bowl',
      'Lentil  5 l  15 bowls',
      'Batches: 5',
    ],
    [
      ['S45', '020l'],
      ['S45', '2 pint'],
      ['S46', 'Pea and Ham'],
      ['S47', '51l'],
    ],
  ],
  [
    '2026-11-10',
    ['Carrot and Coriander  250 ml  0 bowls', 'Minestrone  12 l  38 bowls', 'Batches: 2'],
    [],
  ],
  ['2026-11-17', ['Nothing to serve on 2026-11-17.'], []],
  ['2028-02-29', ['Nothing to serve on 2028-02-29.'], []],
]) {
  const result = run('--servings', date)
  assert.equal(result.status, 0, `--servings ${date} exits 0`)
  assert.equal(result.stdout, lines.join('\n') + '\n', `--servings ${date}`)
  const errors = stderrLines(result)
  for (const line of errors) assert.match(line, /^soup: /, 'stderr lines start with "soup: "')
  for (const [id, what] of problems)
    assert.ok(
      errors.some((line) => line.includes(id) && line.includes(what)),
      `${id}'s ${what} is named on stderr`,
    )
  if (problems.length === 0) assert.equal(errors.length, 0, `nothing on stderr for ${date}`)
}
for (const args of [
  ['--servings'],
  ['--servings', '2026-11-31'],
  ['--servings', '2026-02-29'],
  ['--servings', '2026-00-10'],
  ['--servings', '2026-11-3'],
  ['--servings', '03/11/2026'],
  ['--servings', '2026-11-03T12:00'],
  ['--servings', '2026-11-03 '],
  ['--servings', 'today'],
]) {
  const result = run(...args)
  assert.equal(result.status, 2, `${JSON.stringify(args)} exits 2`)
  assert.equal(result.stdout, '', `${JSON.stringify(args)} prints nothing on stdout`)
  const errors = stderrLines(result)
  assert.ok(errors.length > 0, `${JSON.stringify(args)} explains itself on stderr`)
  for (const line of errors) assert.match(line, /^soup: /, 'stderr lines start with "soup: "')
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
