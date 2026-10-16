// Hidden acceptance for the watering planner: monthly tasks keep the day of the month of their
// first date, clamped to the last day of shorter months, without drifting afterwards; day-based
// tasks are unchanged; and the printed plan is the same in any time zone.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { occurrences, parseDate } = await import(pathToFileURL(join(dir, 'src/schedule.mjs')).href)
const between = (task, start, end) => [...occurrences(task, parseDate(start), parseDate(end))]
const monthly = (from, count = 1) => ({ from, every: { count, unit: 'month' } })
const cases = [
  [
    monthly('2027-01-31'),
    '2027-01-01',
    '2027-07-01',
    ['2027-01-31', '2027-02-28', '2027-03-31', '2027-04-30', '2027-05-31', '2027-06-30'],
  ],
  [monthly('2028-01-31'), '2028-01-01', '2028-04-01', ['2028-01-31', '2028-02-29', '2028-03-31']],
  [
    monthly('2026-12-30', 2),
    '2027-01-01',
    '2027-09-01',
    ['2027-02-28', '2027-04-30', '2027-06-30', '2027-08-30'],
  ],
  [
    monthly('2027-03-31'),
    '2027-03-01',
    '2027-08-01',
    ['2027-03-31', '2027-04-30', '2027-05-31', '2027-06-30', '2027-07-31'],
  ],
  [
    monthly('2024-02-29', 12),
    '2024-01-01',
    '2028-12-31',
    ['2024-02-29', '2025-02-28', '2026-02-28', '2027-02-28', '2028-02-29'],
  ],
  [monthly('2027-01-15'), '2027-02-01', '2027-05-01', ['2027-02-15', '2027-03-15', '2027-04-15']],
  [
    { from: '2027-01-30', every: { count: 10, unit: 'day' } },
    '2027-02-01',
    '2027-03-15',
    ['2027-02-09', '2027-02-19', '2027-03-01', '2027-03-11'],
  ],
]
for (const [task, start, end, want] of cases)
  assert.deepEqual(between(task, start, end), want, `${JSON.stringify(task)} ${start}..${end}`)

// The printed plan, from an independent reference, in three time zones.
const plants = JSON.parse(readFileSync(join(dir, 'data/plants.json'), 'utf8'))
const lastDay = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
function referenceDates(task, start, end) {
  const [y, m, d] = task.from.split('-').map(Number)
  const out = []
  for (let k = 0; ; k++) {
    let date
    if (task.every.unit === 'day') date = new Date(Date.UTC(y, m - 1, d + k * task.every.count))
    else {
      const total = m - 1 + k * task.every.count
      const year = y + Math.floor(total / 12)
      const month = total % 12
      date = new Date(Date.UTC(year, month, Math.min(d, lastDay(year, month))))
    }
    const text = date.toISOString().slice(0, 10)
    if (text >= end) return out
    if (text >= start) out.push(text)
  }
}
const rows = plants
  .flatMap((plant) =>
    plant.tasks.flatMap((task) =>
      referenceDates(task, '2027-01-31', '2027-05-31').map((date) => ({
        date,
        plant: plant.name,
        kind: task.kind,
      })),
    ),
  )
  .sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.plant.localeCompare(b.plant) ||
      a.kind.localeCompare(b.kind),
  )
const expected = rows.map((row) => `${row.date}  ${row.kind.padEnd(5)}  ${row.plant}\n`).join('')
assert.match(expected, /2027-02-28 {2}feed {3}fiddle-leaf fig/)
for (const TZ of ['UTC', 'Pacific/Auckland', 'America/Los_Angeles'])
  assert.equal(
    execFileSync(process.execPath, ['bin/plan.mjs', '2027-01-31', '4'], {
      cwd: dir,
      encoding: 'utf8',
      env: { ...process.env, TZ },
    }),
    expected,
    `plan 2027-01-31 4 with TZ=${TZ}`,
  )
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
