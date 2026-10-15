// Hidden acceptance for the reconcile speed-up: identical results to the original algorithm on
// random months (ties, near-misses, odd references), and the frozen timing script under target.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { reconcile } = await import(pathToFileURL(join(dir, 'src/reconcile.mjs')).href)
const DAY = 86400000
const norm = (ref) =>
  ref
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/^([A-Z]*)0+(?=\d)/, '$1')
const days = (a, b) => Math.abs(new Date(a) - new Date(b)) / DAY
function reference(entries, statement) {
  const used = new Set()
  const matched = []
  for (const item of statement) {
    const cents = Math.round(parseFloat(item.amount) * 100)
    const best = entries
      .filter((e) => !used.has(e.id) && norm(e.ref) === norm(item.ref) && e.amountCents === cents)
      .sort((a, b) => days(a.date, item.date) - days(b.date, item.date) || a.id - b.id)[0]
    if (best && days(best.date, item.date) <= 3) {
      used.add(best.id)
      matched.push([item.line, best.id])
    }
  }
  const lines = new Set(matched.map(([line]) => line))
  return {
    matched,
    unmatchedLines: statement.filter((i) => !lines.has(i.line)).map((i) => i.line),
    unmatchedEntries: entries.filter((e) => !used.has(e.id)).map((e) => e.id),
  }
}
let seed = 11
const next = () => (seed = (seed * 48271) % 2147483647)
const day = (n) => new Date(Date.UTC(2026, 8, 1 + n)).toISOString().slice(0, 10)
const refs = ['INV-0007', 'inv 7', 'INV7', 'po-010', 'PO10', 'P-O 1 0', 'RF-000', 'rf0', 'CR-9']
const amounts = ['1.00', '1', '0.10', '1.005', '2.50', '2.5']
for (let round = 0; round < 60; round++) {
  const entries = Array.from({ length: 25 }, (_, i) => ({
    id: 1 + ((i * 7 + round) % 25),
    ref: refs[next() % refs.length],
    amountCents: Math.round(parseFloat(amounts[next() % amounts.length]) * 100),
    date: day(next() % 12),
  }))
  const statement = Array.from({ length: 20 }, (_, line) => ({
    line: line + 1,
    ref: refs[next() % refs.length],
    amount: amounts[next() % amounts.length],
    date: day(next() % 12),
  }))
  assert.deepEqual(reconcile(entries, statement), reference(entries, statement), `round ${round}`)
}
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 90000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 1214, 'same matches on the month-end data set')
// Target is 5 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 12, `median ${perf.medianMs} ms is far above the 5 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
