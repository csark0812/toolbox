// Hidden acceptance for the overdue hives: the latest inspection is chosen by calendar date, not
// by the text of the date, so hives inspected recently drop off the list, the day counts are
// right across months and years, and the report keeps its shape.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const run = (...args) =>
  execFileSync(process.execPath, ['bin/overdue.mjs', ...args], { cwd: dir, encoding: 'utf8' })
assert.equal(
  run('--today', '2026-11-03'),
  [
    'Hive 2  last 24/09/2026   40 days',
    'Hive 7  last 08/10/2026   26 days',
    'Hive 5  last 18/10/2026   16 days',
    '',
  ].join('\n'),
  'overdue on 3 November',
)
assert.equal(
  run('--today', '2026-10-25'),
  ['Hive 2  last 24/09/2026   31 days', 'Hive 7  last 08/10/2026   17 days', ''].join('\n'),
  'overdue on 25 October',
)
assert.equal(run('--today', '2026-10-06'), 'No hives overdue.\n', 'nothing overdue early on')

const { parseLog } = await import(pathToFileURL(join(dir, 'src/log.mjs')).href)
const { overdue } = await import(pathToFileURL(join(dir, 'src/overdue.mjs')).href)
let seed = 7
const next = () => (seed = (seed * 48271) % 2147483647)
const pad = (n) => String(n).padStart(2, '0')
for (let round = 0; round < 150; round++) {
  const lines = []
  const latest = new Map()
  for (let i = 0; i < 1 + (next() % 12); i++) {
    const hive = String(1 + (next() % 5))
    const day = new Date(2025, 10, 1 + (next() % 120))
    lines.push(
      `${hive},${pad(day.getDate())}/${pad(day.getMonth() + 1)}/${day.getFullYear()},Mara,yes`,
    )
    if (!latest.has(hive) || latest.get(hive) < day) latest.set(hive, day)
  }
  const today = new Date(2026, 1, 1 + (next() % 60))
  const want = [...latest]
    .map(([hive, day]) => [hive, Math.round((today - day) / 86400000)])
    .filter(([, days]) => days > 14)
    .sort((a, b) => b[1] - a[1] || Number(a[0]) - Number(b[0]))
  const got = overdue(parseLog(['hive,date,inspector,queen_seen', ...lines].join('\n')), today).map(
    (hive) => [String(hive.hive), hive.days],
  )
  assert.deepEqual(got, want, `round ${round}: ${lines.join(' ')} at ${today.toDateString()}`)
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
