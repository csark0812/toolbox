// Hidden acceptance for parseHymn and --board: parseHymn reads a hymn number from the book, with
// an optional `v` verse list of single verses and rising ranges in ascending order inside the
// hymn's verse count, all verses when there is no list, and refuses the rest (numeric look-alikes
// included) with a RangeError quoting the text and non-strings with a TypeError. The services
// command prints a service's board with `all` for every verse and a verse total, exits 1 with
// nothing on stdout naming each unreadable hymn, exits 2 for a bad, missing or serviceless date,
// starts every stderr line with `hymns: `, and is unchanged without the option.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { parseHymn } = await import(pathToFileURL(join(dir, 'src/hymns.mjs')).href)
const book = JSON.parse(readFileSync(join(dir, 'data/hymns.json'), 'utf8'))
const read = (text, hymns = book) => {
  const { number, title, verses } = parseHymn(text, hymns)
  return { number, title, verses }
}
const PRAISE = 'Praise to the Holiest in the height'
for (const [text, number, title, verses] of [
  ['372', 372, PRAISE, [1, 2, 3, 4, 5, 6]],
  ['372 v1-3,5', 372, PRAISE, [1, 2, 3, 5]],
  ['372 V1-3, 5', 372, PRAISE, [1, 2, 3, 5]],
  ['372 v 2, 4', 372, PRAISE, [2, 4]],
  ['372 v6', 372, PRAISE, [6]],
  ['372 v1-6', 372, PRAISE, [1, 2, 3, 4, 5, 6]],
  ['8', 8, 'Morning has broken', [1, 2, 3]],
  ['100 v1,2,6-8', 100, 'Abide with me', [1, 2, 6, 7, 8]],
  ['417 v1-4, 9', 417, 'O God, our help in ages past', [1, 2, 3, 4, 9]],
  ['640 v1, 4', 640, 'Come down, O Love divine', [1, 4]],
])
  assert.deepEqual(read(text), { number, title, verses }, text)
assert.deepEqual(
  read('12 v2-3', [{ number: 12, title: 'Twelve', verses: 3 }]),
  { number: 12, title: 'Twelve', verses: [2, 3] },
  'the book passed in is the one used',
)
for (const text of [
  '',
  ' ',
  '0',
  '-8',
  '+8',
  '08',
  '0372',
  '1e2',
  '0x64',
  '100.0',
  '8.',
  ' 372',
  '372 ',
  '9999',
  '371',
  'three',
  '372 v',
  '372 v ',
  '372 v0',
  '372 v7',
  '372 v5-7',
  '372 v3-1',
  '372 v1,1',
  '372 v3,1',
  '372 v1-3,2',
  '372 v1-3,3-4',
  '372 v1,',
  '372 v,1',
  '372 v1--3',
  '372 v1-',
  '372 v-2',
  '372 v1 3',
  '372 v1.5',
  '372 verses 1-3',
  '372 x1-3',
  '372 v1e0',
])
  assert.throws(
    () => parseHymn(text, book),
    (error) => error instanceof RangeError && error.message.includes(text),
    `${JSON.stringify(text)} is refused with a RangeError quoting it`,
  )
for (const value of [372, null, undefined, ['372'], { number: 372 }])
  assert.throws(
    () => parseHymn(value, book),
    TypeError,
    `${String(value)} is refused with a TypeError`,
  )

const run = (...args) =>
  spawnSync(process.execPath, ['bin/services.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const plain = run()
assert.equal(
  plain.stdout,
  [
    '2026-11-01  All Saints           33 | 372 v1-3,5 | 601 | 640 v1, 4',
    '2026-11-08  Remembrance Sunday   417 v1-4, 9 | 100 v1,2,6-8 | 475',
    '2026-11-15  Trinity 23           8 | 245 v2-6 | 410 | 9999',
    '2026-11-22  Christ the King      475 V1-4 | 533 v 1-3, 5 | 117',
    '2026-11-29  Advent Sunday        640 | 372 v1-6',
  ].join('\n') + '\n',
  'without the option the list is unchanged',
)
assert.equal(plain.status, 0)
const stderrLines = (result) => result.stderr.split('\n').filter((line) => line.trim())
for (const [date, lines] of [
  [
    '2026-11-01',
    [
      '33  All people that on earth do dwell  all',
      `372  ${PRAISE}  1, 2, 3, 5`,
      '601  Thine be the glory  all',
      '640  Come down, O Love divine  1, 4',
      'Verses to sing: 14',
    ],
  ],
  [
    '2026-11-08',
    [
      '417  O God, our help in ages past  1, 2, 3, 4, 9',
      '100  Abide with me  1, 2, 6, 7, 8',
      '475  Praise, my soul, the King of heaven  all',
      'Verses to sing: 14',
    ],
  ],
  [
    '2026-11-22',
    [
      '475  Praise, my soul, the King of heaven  all',
      '533  Dear Lord and Father of mankind  1, 2, 3, 5',
      '117  Be thou my vision  all',
      'Verses to sing: 13',
    ],
  ],
  [
    '2026-11-29',
    ['640  Come down, O Love divine  all', `372  ${PRAISE}  all`, 'Verses to sing: 10'],
  ],
]) {
  const result = run('--board', date)
  assert.equal(result.status, 0, `--board ${date} exits 0`)
  assert.equal(result.stdout, lines.join('\n') + '\n', `--board ${date}`)
}
const broken = run('--board', '2026-11-15')
assert.equal(broken.status, 1, 'a service with an unreadable hymn exits 1')
assert.equal(broken.stdout, '', 'a service with an unreadable hymn prints nothing on stdout')
const brokenErrors = stderrLines(broken)
for (const line of brokenErrors) assert.match(line, /^hymns: /, 'stderr lines start with "hymns: "')
assert.ok(
  brokenErrors.some((line) => line.includes('245 v2-6')),
  'names 245 v2-6',
)
assert.ok(
  brokenErrors.some((line) => line.includes('9999')),
  'names 9999 as well',
)
for (const args of [
  ['--board'],
  ['--board', ''],
  ['--board', '2026-11-02'],
  ['--board', '2026-02-30'],
  ['--board', '20261101'],
  ['--board', '1/11/2026'],
]) {
  const result = run(...args)
  assert.equal(result.status, 2, `${JSON.stringify(args)} exits 2`)
  assert.equal(result.stdout, '', `${JSON.stringify(args)} prints nothing on stdout`)
  const errors = stderrLines(result)
  assert.ok(errors.length > 0, `${JSON.stringify(args)} explains itself on stderr`)
  for (const line of errors) assert.match(line, /^hymns: /, 'stderr lines start with "hymns: "')
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
