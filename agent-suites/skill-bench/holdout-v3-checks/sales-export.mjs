// Hidden acceptance for the sales export memory target: byte-identical CSV and return value on
// random inputs (quoting, refunds, missing notes, non-ASCII names, generators and arrays), the
// same full-size export checksum, and the frozen measurement under target.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { exportCsv } = await import(pathToFileURL(join(dir, 'src/export.mjs')).href)

const field = (v) => {
  const t = v === null || v === undefined ? '' : String(v)
  return /[",\n\r]/.test(t) ? `"${t.replaceAll('"', '""')}"` : t
}
const dollars = (c) =>
  `${c < 0 ? '-' : ''}${Math.floor(Math.abs(c) / 100)}.${String(Math.abs(c) % 100).padStart(2, '0')}`
function reference(sales) {
  const lines = ['order_id,date,customer,country,sku,qty,amount,note']
  for (const s of sales)
    lines.push(
      [
        s.orderId,
        new Date(s.at).toISOString().slice(0, 10),
        s.customer.trim(),
        s.country.toUpperCase(),
        s.sku,
        s.qty,
        dollars(s.amountCents),
        s.note ?? '',
      ]
        .map(field)
        .join(','),
    )
  const text = lines.join('\n') + '\n'
  return { text, result: { rows: sales.length, bytes: Buffer.byteLength(text) } }
}
let seed = 5
const next = () => (seed = (seed * 48271) % 2147483647)
const names = ['Zoë Brontë', ' Ana ', 'O"Neil', 'Smith, J', 'line\nbreak', 'plain', '']
const notes = [null, undefined, '', 'a,b', 'q"q', 'cr\rlf', 'ok']
for (let round = 0; round < 80; round++) {
  const sales = Array.from({ length: next() % 30 }, (_, i) => ({
    orderId: next() % 9 === 0 ? `SO,${i}` : `SO-${i}`,
    at: Date.UTC(2026, 0, 1) + (next() % 400) * 86400000 + (next() % 86400000),
    customer: names[next() % names.length],
    country: ['us', 'De', 'JP'][next() % 3],
    sku: `SKU-${next() % 50}`,
    qty: next() % 5,
    amountCents: (next() % 2 ? -1 : 1) * (next() % 100000),
    note: notes[next() % notes.length],
    tags: ['x'],
  }))
  const want = reference(sales)
  for (const input of [
    sales,
    (function* () {
      yield* sales
    })(),
  ]) {
    const chunks = []
    const result = exportCsv(input, { write: (text) => void chunks.push(text) })
    assert.equal(chunks.join(''), want.text, `round ${round}: CSV text`)
    assert.deepEqual(result, want.result, `round ${round}: return value`)
  }
}
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 110000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 400000, 'same number of rows exported')
assert.equal(
  perf.sha256,
  '769249e60f8c772135fc414693485c6f4e755f9a506fd4f5ff9d851bd0388be5',
  'the full-size export is byte-identical',
)
// Target is 150 MB; allow some slack for runtime differences.
assert.ok(perf.medianPeakMb < 175, `median peak ${perf.medianPeakMb} MB is far above 150 MB`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
