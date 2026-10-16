// Hidden acceptance for the meter summary memory work: identical summaries to the original on
// random exports (interleaved meters, gaps, tied peaks, month boundaries, CRLF, blank lines, no
// final newline, files larger than a stream chunk), broken rows still named by line number, and
// the frozen memory script under target with the same result.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { monthlySummary } = await import(pathToFileURL(join(dir, 'src/summary.mjs')).href)

function reference(text) {
  const groups = new Map()
  text.split(/\r?\n/).forEach((line, index) => {
    if (index === 0 || line.trim() === '') return
    const [meter, at, kwh] = line.split(',')
    const key = `${meter}\u0000${at.slice(0, 7)}`
    if (!groups.has(key)) groups.set(key, { meter, month: at.slice(0, 7), list: [] })
    groups.get(key).list.push({ at, kwh: kwh.trim() === '' ? null : Number(kwh) })
  })
  return [...groups.values()]
    .sort((a, b) => (a.meter < b.meter ? -1 : a.meter > b.meter ? 1 : a.month < b.month ? -1 : 1))
    .map(({ meter, month, list }) => {
      let sum = 0
      let peak = null
      for (const r of list)
        if (r.kwh !== null) {
          sum += r.kwh
          if (peak === null || r.kwh > peak.kwh) peak = r
        }
      return {
        meter,
        month,
        kwh: Math.round(sum * 1000) / 1000,
        peakKwh: peak ? peak.kwh : null,
        peakAt: peak ? peak.at : null,
        readings: list.length,
        gaps: list.filter((r) => r.kwh === null).length,
      }
    })
}
const scratch = mkdtempSync(join(tmpdir(), 'meter-check-'))
try {
  let seed = 5
  const next = () => (seed = (seed * 48271) % 2147483647)
  for (let round = 0; round < 40; round++) {
    const meters = 1 + (next() % 6)
    const slots = round % 10 === 0 ? 4000 : next() % 200
    const eol = round % 3 === 0 ? '\r\n' : '\n'
    let text = 'meter,timestamp,kwh' + eol
    const start = Date.UTC(2026, 0, 28 + (next() % 5), 20)
    for (let slot = 0; slot < slots; slot++) {
      const at = new Date(start + slot * 1800000 * (1 + (next() % 30))).toISOString()
      for (let m = 0; m < meters; m++) {
        if (next() % 9 === 0) continue
        const kwh = next() % 8 === 0 ? '' : (next() % 6) / 4 + (next() % 3) / 1000
        text += `M-${(m * 7) % 10},${at.replace('.000Z', 'Z')},${kwh}${eol}`
        if (next() % 50 === 0) text += eol
      }
    }
    if (round % 4 === 1) text = text.replace(/\r?\n$/, '')
    const file = join(scratch, `r${round}.csv`)
    writeFileSync(file, text)
    assert.deepEqual(await monthlySummary(file), reference(text), `round ${round}`)
  }
  const broken = join(scratch, 'broken.csv')
  writeFileSync(
    broken,
    'meter,timestamp,kwh\nM-1,2026-03-01T00:00:00Z,0.5\n\nM-1,2026-03-01T00:30:00Z,0.1\nM-1;oops\n',
  )
  await assert.rejects(monthlySummary(broken), /line 5/, 'a broken row is named by its line')
  assert.match(
    execFileSync(process.execPath, ['bin/summary.mjs', 'data/sample.csv'], {
      cwd: dir,
      encoding: 'utf8',
    }),
    /^M-0007 {2}2026-01 {7}0\.800 kWh {2}peak 0\.412 at 2026-01-31T23:00:00Z {2}2 readings, 0 gaps\n/,
  )
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 110000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 618240, 'every reading is still counted')
assert.equal(
  perf.sha256,
  '9311d5082d292c05eac1b72f685c7cc051062e86fad3aa3d261e3c15fe48a52c',
  'the summary of the quarter is unchanged',
)
// Target is 110 MB; allow a little slack.
assert.ok(
  perf.medianPeakMb < 125,
  `median peak ${perf.medianPeakMb} MB is far above the 110 MB target`,
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
