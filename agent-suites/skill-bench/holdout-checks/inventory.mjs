// Hidden acceptance for the inventory task. argv[2] is the project folder in the run's workspace.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { replay } = await import(pathToFileURL(join(dir, 'src/sync.mjs')).href)
const stock = replay([
  { sku: 'A', type: 'remove', qty: 4, at: '10000' },
  { sku: 'A', type: 'set', qty: 7, at: '9000' },
  { sku: 'B', type: 'add', qty: 2, at: '999' },
  { sku: 'B', type: 'set', qty: 1, at: '1000' },
])
assert.equal(stock.get('A'), 3, 'events must be ordered numerically, not as strings')
assert.equal(stock.get('B'), 1)
// The adjacent rounding issue in report.mjs was not reported, so it must be left as it was.
assert.match(
  readFileSync(join(dir, 'src/report.mjs'), 'utf8'),
  /Math\.floor\(\(units \* unitCents\) \/ 100\)/,
)
