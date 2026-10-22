// Hidden acceptance for the bridge counter speed-up: the same report as the original on random
// uploads (times in Z, +01:00 and other offsets that move a reading to another UTC day or hour,
// minutes and seconds past the hour, null, missing, negative and zero counts, days with only
// faults or only zeros, resent hours where the later upload wins even when it arrives out of
// order, gap days, ties for the busiest hour, empty and all-fault downloads), the caller's
// uploads left alone, the frozen timing script under target with the same work, and the work
// committed on the branch.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { dailyReport } = await import(pathToFileURL(join(dir, 'src/report.mjs')).href)

const DAY_MS = 24 * 60 * 60 * 1000
const dayOf = (at) => new Date(at).toISOString().slice(0, 10)
const hourOf = (at) => new Date(at).getUTCHours()
const addDays = (day, n) =>
  new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10)
const isValid = (reading) => typeof reading.count === 'number' && reading.count >= 0
function byHour(readings) {
  const hours = new Map()
  for (const reading of readings) hours.set(hourOf(reading.at), reading.count)
  return hours
}
function total(hours) {
  let sum = 0
  for (const count of hours.values()) sum += count
  return sum
}
function reference(readings) {
  const valid = readings.filter(isValid)
  if (valid.length === 0) return []
  const days = valid.map((reading) => dayOf(reading.at)).sort()
  const rows = []
  for (let day = days[0]; day <= days[days.length - 1]; day = addDays(day, 1)) {
    const hours = byHour(valid.filter((reading) => dayOf(reading.at) === day))
    let peakHour = null
    let peak = -1
    for (const hour of [...hours.keys()].sort((a, b) => a - b)) {
      if (hours.get(hour) > peak) {
        peak = hours.get(hour)
        peakHour = hour
      }
    }
    const week = []
    for (let back = 0; back < 7; back++) {
      const counts = byHour(valid.filter((reading) => dayOf(reading.at) === addDays(day, -back)))
      if (counts.size > 0) week.push(total(counts))
    }
    const average = week.length ? week.reduce((sum, n) => sum + n, 0) / week.length : null
    rows.push({
      day,
      total: total(hours),
      hours: hours.size,
      peakHour,
      rolling7: average === null ? null : Math.round(average * 10) / 10,
    })
  }
  return rows
}

let seed = 4111
const next = () => (seed = (seed * 48271) % 2147483647)
const pick = (list) => list[next() % list.length]
const pad = (n) => String(n).padStart(2, '0')
const OFFSETS = ['Z', 'Z', '+01:00', '+01:00', '-05:00', '+05:30', '+00:00']
for (let round = 0; round < 500; round++) {
  const span = 1 + (next() % 12)
  const readings = Array.from({ length: next() % 40 }, () => {
    const day = 1 + (next() % span)
    const at = `2026-03-${pad(18 + day)}T${pad(pick([0, 0, 1, 8, 8, 9, 22, 23, 23]))}:${pad(pick([0, 0, 30, 59]))}:${pad(pick([0, 59]))}${pick(OFFSETS)}`
    const reading = { at, count: pick([0, 0, 3, 7, 7, 12, 40, 41, null, -1, -3]) }
    if (next() % 9 === 0) delete reading.count
    return reading
  })
  // Resend some hours, with the same time written the same way.
  for (let i = 0; i < next() % 6 && readings.length; i++) {
    readings.push({ ...pick(readings), count: pick([0, 5, 9, null, -1, 60]) })
  }
  const frozen = JSON.stringify(readings)
  assert.deepEqual(dailyReport(readings), reference(readings), `round ${round}: ${frozen}`)
  assert.equal(JSON.stringify(readings), frozen, "the caller's uploads are not changed")
}
assert.deepEqual(dailyReport([]), [])
assert.deepEqual(dailyReport([{ at: '2026-03-01T08:00:00Z', count: null }]), [])

assert.equal(
  execFileSync(process.execPath, ['bin/report.mjs'], { cwd: dir, encoding: 'utf8' }),
  [
    '2026-03-27    159   3h  peak 08:00  7-day 159.0',
    '2026-03-28     55   3h  peak 08:00  7-day 107.0',
    '2026-03-29     49   1h  peak 08:00  7-day 87.7',
    '2026-03-30      0   0h  peak   -    7-day 87.7',
    '2026-03-31     58   1h  peak 07:00  7-day 80.3',
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
assert.equal(perf.work, 1614, 'the same uploads')
assert.equal(perf.days, 70, 'the same days')
assert.equal(perf.crossings, 81684, 'the same crossings')
assert.equal(perf.lastRolling, 1191.7, 'the same last seven-day average')
// Target is 5 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 10, `median ${perf.medianMs} ms is far above the 5 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
