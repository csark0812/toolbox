// Hidden acceptance for the bookings day-grouping bug: every booking lands on its local day across
// DST changes, whatever order zones and seasons are seen in, and whatever the host time zone is.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const report = pathToFileURL(join(dir, 'src/report.mjs')).href
const scenario = `
import assert from 'node:assert/strict'
const { groupByLocalDay } = await import(${JSON.stringify(report)})
const g = (zone, ...ats) => groupByLocalDay(ats.map((at, i) => ({ id: 'x' + i, at })), zone)
// The reported week: winter offset first, then the spring-forward change on 8 March.
assert.deepEqual(
  g('America/Toronto', '2026-03-06T14:00:00Z', '2026-03-10T21:00:00Z', '2026-03-11T04:30:00Z', '2026-03-12T04:10:00Z'),
  { '2026-03-06': ['x0'], '2026-03-10': ['x1'], '2026-03-11': ['x2'], '2026-03-12': ['x3'] },
  'a 00:30 EDT booking belongs to its own day after the DST change',
)
// Summer seen first, then winter, in separate calls (no stale per-zone state).
assert.deepEqual(g('America/Toronto', '2026-07-01T04:30:00Z'), { '2026-07-01': ['x0'] })
assert.deepEqual(g('America/Toronto', '2026-01-10T04:30:00Z'), { '2026-01-09': ['x0'] })
// Fall back in November.
assert.deepEqual(
  g('America/Toronto', '2026-10-31T23:30:00Z', '2026-11-02T04:30:00Z'),
  { '2026-10-31': ['x0'], '2026-11-01': ['x1'] },
)
// Other zones, including a half-hour offset and a southern-hemisphere DST change.
assert.deepEqual(g('Asia/Kolkata', '2026-03-10T18:45:00Z'), { '2026-03-11': ['x0'] })
assert.deepEqual(
  g('Australia/Sydney', '2026-04-04T13:30:00Z', '2026-04-05T13:30:00Z'),
  { '2026-04-05': ['x0', 'x1'] },
)
`
for (const TZ of ['UTC', 'Pacific/Auckland', 'America/Los_Angeles'])
  try {
    execFileSync(process.execPath, ['--input-type=module', '-e', scenario], {
      env: { ...process.env, TZ },
      stdio: 'pipe',
    })
  } catch (error) {
    assert.fail(`host TZ=${TZ}: ${String(error.stderr).split('\n').slice(0, 12).join('\n')}`)
  }
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
