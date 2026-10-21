// Development check for the minibus log: miles logged as text add up like numbers inside the
// shared helper, so the invoice and the report both agree; the log is untouched and tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const trips = JSON.parse(readFileSync(join(dir, 'data/trips.json'), 'utf8'))
assert.deepEqual(
  trips.map((t) => t.miles),
  [12, 24, 12, '38', '56', 12, 24, 12, '31.5', 61],
  'the trip log is left as it was copied in',
)
const run = (bin) =>
  execFileSync(process.execPath, [bin], { cwd: dir, encoding: 'utf8' }).replace(/\s+/g, ' ')
const invoice = run('bin/invoice.mjs')
assert.match(invoice, /Brownies 4 trips 117\.5 miles £47\.00/)
assert.match(invoice, /Lunch club 4 trips 48 miles £19\.20/)
assert.match(invoice, /Walking group 2 trips 117 miles £46\.80/)
assert.match(invoice, /Total owed: £113\.00/)
assert.match(run('bin/report.mjs'), /282\.5 miles over 10 trips/)
const { totalMiles } = await import(pathToFileURL(join(dir, 'src/miles.mjs')).href)
assert.equal(
  totalMiles([{ miles: '2.5' }, { miles: 1 }]),
  3.5,
  'the shared helper reads miles written as text',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
