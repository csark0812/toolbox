// Hidden acceptance for the timesheet report speed-up: identical reports to the original
// algorithm on random exports (shifts past midnight, unknown people, year-boundary ISO weeks,
// accented names that need the locale-aware sort), and the frozen timing script under target.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { weeklyReport } = await import(pathToFileURL(join(dir, 'src/report.mjs')).href)

function reference(entries, people) {
  const week = (date) => {
    const day = new Date(`${date}T00:00:00Z`)
    const index = (day.getUTCDay() + 6) % 7
    const thursday = new Date(day.getTime() + (3 - index) * 86400000)
    const n = Math.ceil(((thursday - Date.UTC(thursday.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7)
    return `${thursday.getUTCFullYear()}-W${String(n).padStart(2, '0')}`
  }
  const minutes = (s, e) => {
    const m = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3))
    const d = m(e) - m(s)
    return d < 0 ? d + 1440 : d
  }
  const hours = (min) => Math.round((min / 60) * 100) / 100
  const rows = []
  for (const person of people) {
    const weeks = new Map()
    for (const entry of entries.filter((x) => x.person === person.id)) {
      const w = week(entry.date)
      const t = weeks.get(w) ?? { minutes: 0, projects: new Set(), shifts: 0 }
      weeks.set(w, t)
      t.minutes += minutes(entry.start, entry.end)
      t.projects.add(entry.project)
      t.shifts++
    }
    for (const [w, t] of weeks)
      rows.push({
        person: person.name,
        week: w,
        shifts: t.shifts,
        hours: hours(t.minutes),
        overtime: hours(Math.max(0, t.minutes - 2400)),
        projects: [...t.projects].sort().join(', '),
      })
  }
  rows.sort((a, b) => a.person.localeCompare(b.person, 'en') || a.week.localeCompare(b.week, 'en'))
  const known = new Set(people.map((p) => p.id))
  return { rows, skipped: entries.filter((x) => !known.has(x.person)).length }
}
let seed = 41
const next = () => (seed = (seed * 48271) % 2147483647)
const names = [
  'Tomás Ruiz',
  'Tomas Berg',
  'tomás ito',
  'Émile Roy',
  'Emile Ray',
  'Zoë Lane',
  'zoe Lam',
  'Ana',
  'Åsa Lund',
  'Óscar Paz',
]
const pad = (n) => String(n).padStart(2, '0')
for (let round = 0; round < 80; round++) {
  const people = names
    .slice(0, 1 + (next() % names.length))
    .map((name, i) => ({ id: `p${i}`, name }))
  const entries = Array.from({ length: next() % 120 }, () => ({
    person: next() % 9 === 0 ? 'nobody' : `p${next() % people.length}`,
    project: ['kiln', 'Atlas', 'beacon', 'atlas', 'Zephyr'][next() % 5],
    date: new Date(
      Date.UTC(2020, 11, 20) + (next() % 30) * 86400000 + (next() % 4) * 365 * 86400000,
    )
      .toISOString()
      .slice(0, 10),
    start: `${pad(next() % 24)}:${pad(next() % 60)}`,
    end: `${pad(next() % 24)}:${pad(next() % 60)}`,
  }))
  assert.deepEqual(weeklyReport(entries, people), reference(entries, people), `round ${round}`)
}
assert.deepEqual(weeklyReport([], []), { rows: [], skipped: 0 })
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 110000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 30000, 'every synthetic shift is still counted')
// Target is 20 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 45, `median ${perf.medianMs} ms is far above the 20 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
