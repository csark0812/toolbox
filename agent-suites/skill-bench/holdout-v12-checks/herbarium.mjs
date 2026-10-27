// Hidden acceptance for parseAccession(), checkCharacter() and --audit: `HB`, a year from 1880 to
// 2026, a slash, a serial from 1 to 99999 without leading zeros, a hyphen and a mod-11 check character
// (weights 2 to 7 from the right, 10 as X in either case, 11 as 0); bad text is a RangeError quoting it
// and non-strings a TypeError. The audit names the first problem of each sheet in file order
// (unreadable, wrong check character with the right one, duplicate of an earlier readable sheet as
// written, collected after the accession year), ends with a count line, exits 1 with problems and 0
// without, exits 2 with nothing on stdout for an unreadable file or extra arguments, writes
// `herbarium: ` on every stderr line, and leaves the plain list unchanged.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { parseAccession, checkCharacter } = await import(
  pathToFileURL(join(dir, 'src/accession.mjs')).href
)

for (const [year, serial, char] of [
  [1923, 417, '7'],
  [1880, 1, '8'],
  [2026, 99999, '8'],
  [1954, 205, 'X'],
  [1954, 230, '0'],
  [1961, 89, '6'],
  [1999, 45, '1'],
]) {
  assert.equal(String(checkCharacter(year, serial)).toUpperCase(), char, `${year}/${serial}`)
}
for (const [text, year, serial] of [
  ['HB1923/417-7', 1923, 417],
  ['HB1880/1-8', 1880, 1],
  ['HB2026/99999-8', 2026, 99999],
  ['HB1954/205-X', 1954, 205],
  ['HB1954/205-x', 1954, 205],
  ['HB1954/230-0', 1954, 230],
]) {
  const parsed = parseAccession(text)
  assert.deepEqual(
    { year: parsed.year, serial: parsed.serial },
    { year, serial },
    `${text} reads as ${year}/${serial}`,
  )
}
for (const text of [
  'HB1879/12-X',
  'HB2027/5-4',
  'HB1990/012-8',
  'hb1990/12-8',
  'Hb1990/12-8',
  'HB1975/0-5',
  'HB1975/100000-9',
  'HB 1923/417-7',
  'HB1923/ 417-7',
  'HB1923/417 -7',
  'HB1923-417-7',
  'HB1923/417-',
  'HB1923/417',
  'HB1923/417-77',
  'HB923/417-4',
  'HB01923/417-7',
  'HB1923/417-7 ',
  ' HB1923/417-7',
  'HB1923/+417-7',
  'HB1923/4e2-7',
  'HB1954/230-O',
  'HB1923/417-6',
  'HB1954/205-0',
  'HB1954/230-X',
  'HB1990/12-3',
  '',
]) {
  assert.throws(
    () => parseAccession(text),
    (error) => error instanceof RangeError && error.message.includes(text),
    `${JSON.stringify(text)} is refused with a RangeError quoting it`,
  )
}
for (const value of [19234177, null, undefined, {}])
  assert.throws(() => parseAccession(value), TypeError, `${String(value)} is a TypeError`)

const run = (...args) =>
  spawnSync(process.execPath, ['bin/specimens.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const stderrLines = (result) => result.stderr.split('\n').filter((line) => line.trim())
const plain = run()
assert.equal(plain.status, 0)
assert.equal(plain.stdout.split('\n').length, 21, 'without the option every sheet is listed')
assert.equal(plain.stdout.split('\n')[0], 'HB1923/417-7  Primula vulgaris  E. Hale  1923-04-12')
assert.match(plain.stdout, /\nHB2001\/7-4 {2}Hedera helix {2}unknown {2}date unknown\n/)

const audit = run('--audit')
assert.equal(audit.status, 1, '--audit with problems exits 1')
assert.equal(
  audit.stdout,
  [
    'HB1879/12-X  unreadable',
    'HB1990/012-8  unreadable',
    'hb1990/12-8  unreadable',
    'HB1990/12-3  check character should be 8',
    'HB1923/417-7  duplicate of HB1923/417-7',
    'HB1954/205-X  duplicate of HB1954/205-x',
    'HB1961/88-8  collected after accession',
    'HB2027/5-4  unreadable',
    'HB1990/12-8  duplicate of HB1990/12-3',
    'HB1975/100000-9  unreadable',
    'HB1975/0-5  unreadable',
    'HB1999/45-7  check character should be 1',
    'HB1954/230-O  unreadable',
    'Problems: 13 of 20',
  ].join('\n') + '\n',
  '--audit of data/specimens.json',
)
for (const line of stderrLines(audit))
  assert.match(line, /^herbarium: /, 'stderr lines start with "herbarium: "')

const tmp = mkdtempSync(join(tmpdir(), 'herbarium-'))
const write = (name, text) => {
  writeFileSync(join(tmp, name), text)
  return join(tmp, name)
}
const clean = write(
  'clean.json',
  JSON.stringify([
    { accession: 'HB1954/205-x', taxon: 'Orchis mascula', collector: 'M. Kerr', collected: null },
    {
      accession: 'HB2026/99999-8',
      taxon: 'Bellis',
      collector: 'R. Okafor',
      collected: '2026-12-31',
    },
    { accession: 'HB1961/89-6', taxon: 'Geranium', collector: 'A. Fox', collected: '1950-01-01' },
  ]),
)
const ok = run('--audit', clean)
assert.equal(ok.status, 0, 'a clean file exits 0')
assert.equal(ok.stdout, 'All 3 check out.\n', 'a clean file')

const one = write(
  'one.json',
  JSON.stringify([
    {
      accession: 'HB1880/1-8',
      taxon: 'Ranunculus',
      collector: 'J. Marlow',
      collected: '1881-01-01',
    },
    { accession: 'HB1880/1-X', taxon: 'Ranunculus', collector: 'J. Marlow', collected: null },
  ]),
)
const two = run('--audit', one)
assert.equal(two.status, 1)
assert.equal(
  two.stdout,
  'HB1880/1-8  collected after accession\nHB1880/1-X  check character should be 8\nProblems: 2 of 2\n',
  'a second file is audited, with the first problem that applies',
)

for (const args of [
  ['--audit', join(tmp, 'missing.json')],
  ['--audit', write('object.json', '{"accession": "HB1923/417-7"}')],
  ['--audit', write('broken.json', '[{"accession": ')],
  ['--audit', clean, one],
]) {
  const result = run(...args)
  assert.equal(result.status, 2, `${JSON.stringify(args)} exits 2`)
  assert.equal(result.stdout, '', `${JSON.stringify(args)} prints nothing on stdout`)
  const lines = stderrLines(result)
  assert.ok(lines.length > 0, `${JSON.stringify(args)} explains itself on stderr`)
  for (const line of lines)
    assert.match(line, /^herbarium: /, 'stderr lines start with "herbarium: "')
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
