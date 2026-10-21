// Hidden acceptance for the yardage rename: the calculators live in src/yardage.mjs under their
// new names only, fabric.mjs is gone, nothing anywhere still says calc_ (the patterns file
// included), the values are unchanged, and the cut list and shop order print exactly as before
// although the old labels came from the function names.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
assert.ok(!existsSync(join(dir, 'src/fabric.mjs')), 'src/fabric.mjs is deleted')
const yardage = await import(pathToFileURL(join(dir, 'src/yardage.mjs')).href)
for (const name of ['backingYards', 'battingYards', 'bindingInches'])
  assert.equal(typeof yardage[name], 'function', `src/yardage.mjs exports ${name}`)
assert.deepEqual(
  Object.keys(yardage).filter((name) => /calc|_/.test(name)),
  [],
  'no old names are exported',
)
const quarter = (inches) => Math.ceil((inches / 36) * 4) / 4
let seed = 19
const next = () => (seed = (seed * 48271) % 2147483647)
for (let i = 0; i < 200; i++) {
  const quilt = { name: 'Q', width: 10 + (next() % 120), length: 10 + (next() % 120) }
  assert.equal(
    yardage.backingYards(quilt),
    quarter(Math.ceil((quilt.width + 8) / 40) * (quilt.length + 8)),
  )
  assert.equal(
    yardage.battingYards(quilt),
    Math.ceil((quilt.width + 8) / 90) * quarter(quilt.length + 8),
  )
  assert.equal(yardage.bindingInches(quilt), 2 * (quilt.width + quilt.length) + 10)
}
const run = (script) =>
  execFileSync(process.execPath, [`bin/${script}.mjs`], { cwd: dir, encoding: 'utf8' })
assert.equal(
  run('cutlist'),
  [
    'Lone Star throw (60 x 72 in)',
    '  backing: 4.50 yd',
    '  batting: 2.25 yd',
    '  binding: 274 in, 7 strips',
    'Log cabin king (104 x 98 in)',
    '  backing: 9.00 yd',
    '  batting: 6.00 yd',
    '  binding: 414 in, 11 strips',
    'Hexie table runner (14 x 48 in)',
    '  backing: 1.75 yd',
    '  binding: 134 in, 4 strips',
    'Baby nine-patch (36 x 42 in)',
    '  backing: 3.00 yd',
    '  batting: 1.50 yd',
    '  binding: 166 in, 5 strips',
    '',
  ].join('\n'),
  'the cut list is unchanged',
)
assert.equal(
  run('order'),
  [
    'Backing order',
    '  Lone Star throw     4.50 yd',
    '  Log cabin king      9.00 yd',
    '  Hexie table runner  1.75 yd',
    '  Baby nine-patch     3.00 yd',
    '  Total               18.25 yd',
    '',
  ].join('\n'),
  'the shop order is unchanged',
)
const walk = (folder) =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(folder, entry.name)) : [join(folder, entry.name)],
  )
for (const file of walk(dir))
  assert.doesNotMatch(
    readFileSync(file, 'utf8'),
    /calc_(backing|batting|binding)/,
    `${relative(dir, file)} still uses an old name`,
  )
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
