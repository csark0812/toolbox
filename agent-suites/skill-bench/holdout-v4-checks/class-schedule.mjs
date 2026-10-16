// Hidden acceptance for the class-schedule DST fix: every session of a weekly class starts at the
// class's wall-clock time and weekday in its own zone across DST changes in both hemispheres,
// sessions stay one local week apart, and the CLI prints the November classes at their usual time.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { timetable } = await import(pathToFileURL(join(dir, 'src/schedule.mjs')).href)
const { wallClock } = await import(pathToFileURL(join(dir, 'src/zone.mjs')).href)
const classes = [
  ['chi', 'Tue', '18:00', 'America/Chicago', '2026-09-01'],
  ['chi-early', 'Sat', '07:30', 'America/Chicago', '2026-09-05'],
  ['ldn', 'Thu', '19:15', 'Europe/London', '2026-09-03'],
  ['syd', 'Mon', '06:45', 'Australia/Sydney', '2026-08-03'],
  ['nyc-late', 'Sun', '23:30', 'America/New_York', '2026-09-06'],
  ['sp', 'Wed', '12:00', 'America/Sao_Paulo', '2026-09-02'],
  ['utc', 'Fri', '09:00', 'UTC', '2026-09-04'],
].map(([id, weekday, time, timeZone, starts]) => ({
  id,
  name: id,
  weekday,
  time,
  timeZone,
  starts,
}))
const rows = timetable(classes, '2026-09-10', 240)
const pad = (n) => String(n).padStart(2, '0')
for (const cls of classes) {
  const mine = rows.filter((row) => row.id === cls.id)
  assert.ok(
    mine.length >= 33,
    `${cls.id}: about 34 weekly sessions in 240 days, got ${mine.length}`,
  )
  let previous
  for (const row of mine) {
    const w = wallClock(new Date(row.start), cls.timeZone)
    assert.equal(
      `${w.weekday} ${pad(w.hour)}:${pad(w.minute)}`,
      `${cls.weekday} ${cls.time}`,
      `${cls.id} on ${new Date(row.start).toISOString()} keeps its local weekday and time`,
    )
    const day = Date.UTC(w.year, w.month - 1, w.day)
    if (previous !== undefined) assert.equal(day - previous, 7 * 86400000, `${cls.id} is weekly`)
    previous = day
  }
}
const out = execFileSync(process.execPath, ['bin/schedule.mjs', '2026-10-26', '14'], {
  cwd: dir,
  encoding: 'utf8',
})
for (const line of [
  'Tue 2026-10-27 18:00  Vinyasa Flow',
  'Thu 2026-10-29 19:15  Yin (online, London)',
  'Sat 2026-10-31 07:30  Sunrise Stretch',
  'Tue 2026-11-03 18:00  Vinyasa Flow',
  'Thu 2026-11-05 19:15  Yin (online, London)',
  'Sat 2026-11-07 07:30  Sunrise Stretch',
])
  assert.ok(out.includes(`${line}\n`), `schedule prints "${line}"\n${out}`)
assert.doesNotMatch(out, / (17:00|06:30|18:15|20:15) /, 'no session is an hour off')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
