// Hidden acceptance for the flood alert speed-up: the same periods as the original on random feeds
// (shuffled order, gaps, failed and repeated readings, a gauge with no threshold, and four-reading
// means that land exactly on the threshold, where a running sum drifts), the frozen timing script
// under target with the same work, and the work committed on the branch.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { alertPeriods } = await import(pathToFileURL(join(dir, 'src/alerts.mjs')).href)

const STEP = 15 * 60 * 1000
const time = (at) => new Date(`${at}Z`)
function reference(readings, thresholds) {
  const gauges = [...new Set(readings.map((reading) => reading.gauge))]
  const periods = []
  for (const gauge of gauges) {
    const mine = readings
      .filter((reading) => reading.gauge === gauge && reading.level !== null)
      .sort((a, b) => time(a.at) - time(b.at))
    let open = null
    mine.forEach((reading, i) => {
      const window = mine.filter((_, j) => j > i - 4 && j <= i)
      const unbroken =
        window.length === 4 &&
        window.every((entry, k) => k === 0 || time(entry.at) - time(window[k - 1].at) === STEP)
      const mean = window.reduce((sum, entry) => sum + entry.level, 0) / window.length
      if (unbroken && mean > thresholds[gauge]) {
        if (open && time(reading.at) - time(open.to) === STEP) {
          open.to = reading.at
          open.peak = Math.max(open.peak, reading.level)
          open.readings++
        } else {
          open = { gauge, from: reading.at, to: reading.at, peak: reading.level, readings: 1 }
          periods.push(open)
        }
      } else open = null
    })
  }
  return periods.sort(
    (a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : 0) || (a.gauge < b.gauge ? -1 : 1),
  )
}
let seed = 31
const next = () => (seed = (seed * 48271) % 2147483647)
const LEVELS = [0.1, 0.2, 0.3, 0.7, 1.1, 1.2, 1.3, 2.35, 2.45]
for (let round = 0; round < 400; round++) {
  const thresholds = { North: [0.2, 0.3, 0.7, 1.2][next() % 4], South: [0.6, 1.2, 2.4][next() % 3] }
  const readings = []
  for (const gauge of ['North', 'South', 'East']) {
    let step = 0
    for (let n = next() % 30; n > 0; n--) {
      step += next() % 9 === 0 ? 2 : next() % 15 === 0 ? 0 : 1
      readings.push({
        gauge,
        at: new Date(Date.UTC(2026, 10, 1) + step * STEP).toISOString().slice(0, 16),
        level: next() % 12 === 0 ? null : LEVELS[next() % LEVELS.length],
      })
    }
  }
  for (let i = readings.length - 1; i > 0; i--) {
    const j = next() % (i + 1)
    ;[readings[i], readings[j]] = [readings[j], readings[i]]
  }
  const frozen = JSON.stringify(readings)
  assert.deepEqual(
    alertPeriods(readings, thresholds),
    reference(readings, thresholds),
    `round ${round}: ${frozen} with ${JSON.stringify(thresholds)}`,
  )
  assert.equal(JSON.stringify(readings), frozen, "the caller's readings are not changed")
}
assert.equal(
  execFileSync(process.execPath, ['bin/alerts.mjs'], { cwd: dir, encoding: 'utf8' }),
  [
    'Kempsey    2026-11-09T07:00 to 07:45  peak 3.20 m  (4 readings)',
    'Upton      2026-11-09T07:15 to 08:30  peak 2.70 m  (6 readings)',
    'Kempsey    2026-11-09T09:00 to 10:00  peak 3.40 m  (5 readings)',
    'Upton      2026-11-09T09:45 to 10:45  peak 2.90 m  (5 readings)',
    '',
  ].join('\n'),
)
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 110000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 99, 'the same number of alert periods')
assert.equal(perf.alertReadings, 7348, 'the same alert readings')
// Target is 20 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 45, `median ${perf.medianMs} ms is far above the 20 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
