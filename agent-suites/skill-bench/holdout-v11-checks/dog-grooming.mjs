// Hidden acceptance for the grooming bills: grooms are counted per dog, meaning the same owner
// and dog name however the online form cased or spaced them, two dogs with the same name are
// counted apart, a free groom still charges its extras, October bills right, and the tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
assert.equal(
  execFileSync(process.execPath, ['bin/bill.mjs', '2026-10'], { cwd: dir, encoding: 'utf8' }),
  [
    '2026-10-02  Hughes    Max       groom 3         £30.00',
    '2026-10-06  Nkemelu   Rocco     groom 6 (free)  £8.00',
    '2026-10-07  Grant     Luna      groom 8         £30.00',
    '2026-10-09  Jones     Max       groom 4         £46.00',
    '2026-10-14  Patel     Biscuit   groom 6 (free)  £5.00',
    '2026-10-16  Hughes    Max       groom 4         £35.00',
    '2026-10-20  Price     Bella     groom 3         £35.00',
    '2026-10-21  Grant     Luna      groom 9         £30.00',
    '2026-10-22  Ashby     Pepper    groom 6 (free)  £6.00',
    'total: £225.00',
    '',
  ].join('\n'),
  'October is billed right',
)
const { priceGrooms } = await import(pathToFileURL(join(dir, 'src/prices.mjs')).href)
const data = JSON.parse(readFileSync(join(dir, 'data/grooms.json'), 'utf8'))
const luna = priceGrooms(data).find(({ groom }) => groom.date === '2026-09-09')
assert.deepEqual(
  [luna.number, luna.free, luna.price],
  [6, true, 5],
  "Luna's free groom in September",
)
const g = (owner, dog, extras = []) => ({ date: '2026-10-01', owner, dog, size: 'medium', extras })
const run = (grooms) => priceGrooms(grooms).map(({ number, price }) => `${number}:${price}`)
assert.deepEqual(
  run([
    g('Lee', 'Fudge'),
    g('lee', 'fudge'),
    g('Lee ', ' Fudge'),
    g('LEE', 'FUDGE'),
    g('Lee', 'Fudge '),
    g('Lee', 'Fudge', ['flea bath', 'teeth']),
  ]),
  ['1:38', '2:38', '3:38', '4:38', '5:38', '6:14'],
  'one dog however it was typed, and extras charged on the free groom',
)
assert.deepEqual(
  run([
    g('Lee', 'Fudge'),
    g('Ross', 'Fudge'),
    g('Lee', 'Fudge'),
    g('Ross', 'Fudge'),
    g('Lee', 'Fudge'),
    g('Ross', 'Fudge'),
    g('Lee', 'Fudge'),
    g('Lee', 'Fudge'),
    g('Lee', 'Fudge'),
  ]),
  ['1:38', '1:38', '2:38', '2:38', '3:38', '3:38', '4:38', '5:38', '6:0'],
  'two dogs with the same name are counted apart',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
