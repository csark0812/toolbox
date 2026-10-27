// Hidden acceptance for the honey co-op statements: bench scale weights written with a decimal
// comma ('12,35') are read in full, the new price applies from 1 September itself, the August and
// September statements come out right, and the tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const run = (month) =>
  execFileSync(process.execPath, ['bin/statement.mjs', month], { cwd: dir, encoding: 'utf8' })
assert.equal(
  run('2026-09'),
  [
    'Helen Moyle      21.95 kg   £179.99',
    'Priya Nair        5.40 kg    £44.28',
    'Tom Ashworth     19.70 kg   £161.54',
    'Gareth Lloyd     20.00 kg   £164.00',
    'Ruth Barlow       4.75 kg    £38.95',
    'Sam Okoro         7.08 kg    £58.06',
    'Total            78.88 kg   £646.82',
    '',
  ].join('\n'),
  'September statement',
)
assert.equal(
  run('2026-08'),
  [
    'Tom Ashworth     18.40 kg   £138.00',
    'Priya Nair        7.20 kg    £54.00',
    'Gareth Lloyd     14.60 kg   £109.50',
    'Ruth Barlow       9.84 kg    £73.80',
    'Helen Moyle       6.00 kg    £45.00',
    'Sam Okoro        11.00 kg    £82.50',
    'Total            67.04 kg   £502.80',
    '',
  ].join('\n'),
  'August statement',
)
const { deliveryPence } = await import(pathToFileURL(join(dir, 'src/pay.mjs')).href)
const pay = (date, kg, scale = 'bench') => deliveryPence({ member: 'T', date, kg, scale })
assert.equal(pay('2026-09-10', '2,5'), 2050, 'decimal comma')
assert.equal(pay('2026-10-02', '0,75'), 615, 'decimal comma under a kilo')
assert.equal(pay('2026-09-10', '13'), 10660, 'whole kilos from the bench scale')
assert.equal(pay('2026-09-10', 3.25, 'store'), 2665, 'store scale numbers')
assert.equal(pay('2026-09-01', 10, 'store'), 8200, 'new price on 1 September')
assert.equal(pay('2026-08-31', '10,0'), 7500, 'old price on 31 August')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
