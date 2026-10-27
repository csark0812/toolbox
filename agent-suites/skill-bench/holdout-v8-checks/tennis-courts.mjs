// Hidden acceptance for the refused tennis bookings: every request gets its real outcome on the
// import, the member-code check gives the same answer however many times it runs, Windows line
// endings in the office export still load, and the tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
assert.equal(
  execFileSync(process.execPath, ['bin/import.mjs'], { cwd: dir, encoding: 'utf8' }),
  [
    ' 1  M1001  court 1  2026-11-07 09:00  booked',
    ' 2  M1002  court 2  2026-11-07 09:00  booked',
    ' 3  M1005  court 1  2026-11-07 10:00  booked',
    ' 4  M1004  court 3  2026-11-07 09:00  booked',
    ' 5  M1003  court 2  2026-11-07 10:00  refused: membership expired',
    ' 6  M1007  court 1  2026-11-07 09:00  refused: court taken',
    ' 7  M1009  court 4  2026-11-07 11:00  refused: unknown member',
    ' 8  M1001  court 5  2026-11-08 09:00  refused: no such court',
    ' 9  M1002  court 2  2026-11-07 11:00  booked',
    '',
  ].join('\n'),
  'the import gives every request its real outcome',
)
const { problemWith, importRequests } = await import(
  pathToFileURL(join(dir, 'src/bookings.mjs')).href
)
const { loadMembers } = await import(pathToFileURL(join(dir, 'src/members.mjs')).href)
const members = loadMembers(
  'code,name,expires\r\nM2001,Ada Byrne,2027-05-01\r\nM2002,Kofi Mensah,2027-05-01 \r\n',
)
assert.deepEqual(members.get('M2002'), { name: 'Kofi Mensah', expires: '2027-05-01' })
for (let i = 0; i < 25; i++) {
  const code = i % 2 ? 'M2001' : 'M2002'
  assert.equal(
    problemWith({ member: code, court: 1 + (i % 4), date: '2026-12-01', hour: 9 }, members),
    null,
    `call ${i + 1} for ${code} in a row`,
  )
}
for (const bad of ['M200', 'M20011', 'm2001', 'X2001', 'M20O1', ''])
  assert.equal(
    problemWith({ member: bad, court: 1, date: '2026-12-01', hour: 9 }, members),
    'unknown member',
    JSON.stringify(bad),
  )
const results = importRequests(
  Array.from({ length: 8 }, (_, i) => ({
    member: i % 2 ? 'M2001' : 'M2002',
    court: 1 + (i % 4),
    date: '2026-12-02',
    hour: 9 + Math.floor(i / 4),
  })),
  members,
)
assert.deepEqual(
  results.map((result) => result.problem),
  Array(8).fill(null),
  'eight free courts in a row are all booked',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
