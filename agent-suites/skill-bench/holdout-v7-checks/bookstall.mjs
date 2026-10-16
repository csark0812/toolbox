// Hidden acceptance for ISBN look-up: normalizeIsbn turns ISBN-10 and ISBN-13 (with hyphens,
// spaces and X check digits) into the 13-digit form and refuses wrong lengths, characters,
// prefixes and check digits with a RangeError quoting the input; find accepts every form.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { normalizeIsbn } = await import(pathToFileURL(join(dir, 'src/isbn.mjs')).href)
const { findBook } = await import(pathToFileURL(join(dir, 'src/stock.mjs')).href)
for (const [text, isbn] of [
  ['9780140449136', '9780140449136'],
  ['978-0-14-044913-6', '9780140449136'],
  ['0140449132', '9780140449136'],
  ['0-14-044913-2', '9780140449136'],
  ['080442957X', '9780804429573'],
  ['0-8044-2957-x', '9780804429573'],
  ['0 571 33465 2', '9780571334650'],
  ['979-10-329-0445-9', '9791032904459'],
  ['1408855658', '9781408855652'],
])
  assert.equal(normalizeIsbn(text), isbn, text)
for (const text of [
  '0140449133',
  '9780140449137',
  '97801404491',
  '01404491321',
  '978014044913X',
  'X140449132',
  '9770140449137',
  '01404491a2',
  '',
])
  assert.throws(
    () => normalizeIsbn(text),
    (error) => error instanceof RangeError && error.message.includes(text),
    `${JSON.stringify(text)} is refused with a RangeError quoting it`,
  )
const stock = JSON.parse(readFileSync(join(dir, 'data/stock.json'), 'utf8'))
assert.equal(findBook(stock, '0-14-044913-2')?.title, 'Crime and Punishment')
assert.equal(findBook(stock, '9780804429573')?.title, 'Wolf Hall')
assert.equal(findBook(stock, '9780000000002'), undefined)

const find = (query) =>
  spawnSync(process.execPath, ['bin/find.mjs', query], { cwd: dir, encoding: 'utf8' })
let result = find('080442957X')
assert.equal(result.stdout, 'Wolf Hall  shelf A1  £4.00\n')
assert.equal(result.status, 0)
assert.equal(find('978 0 571 33465 0').stdout, 'Normal People  shelf A3  £3.00\n')
result = find('9780000000002')
assert.equal(result.stdout, 'Not in stock: 9780000000002\n')
assert.equal(result.status, 1)
result = find('0140449133')
assert.equal(result.status, 2, 'a bad ISBN exits 2')
assert.match(result.stdout + result.stderr, /Not a valid ISBN: 0140449133/)
assert.doesNotMatch(result.stdout, /Not in stock/)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
