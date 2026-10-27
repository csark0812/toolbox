// Hidden acceptance for the squash court fees: online bookings exported as UTC instants are priced
// by UK club time (BST until 25 October 2026, GMT after), peak starts at 17:00 itself, the fees do
// not depend on the computer's timezone, the October and September totals are right, and the
// tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const feesUrl = pathToFileURL(join(dir, 'src/fees.mjs')).href
const bookings = JSON.parse(readFileSync(join(dir, 'data/bookings.json'), 'utf8'))
const adults = [
  { name: 'A', junior: false },
  { name: 'B', junior: false },
]
const extra = [
  ['2026-03-30T16:30:00Z', 900, 'online after the clocks go forward'],
  ['2026-03-27T16:30:00Z', 600, 'online before the clocks go forward'],
  ['2026-10-09T23:30:00Z', 700, 'online just after midnight on a Saturday, club time'],
  ['2026-10-30T23:30:00Z', 900, 'online late on a Friday in GMT'],
  ['2026-10-26T16:59:00Z', 600, 'online one minute before peak in GMT'],
  ['2026-10-07 16:59', 600, 'desk one minute before peak'],
  ['2026-10-07 17:00', 900, 'desk at 17:00'],
]
const expected = [900, 900, 900, 900, 900, 600, 900, 900, 700, 900, 900, 900, 600, 900, 600]
expected.push(900, 600, 700, 600, 900, 900)
const script = `
const { courtFee } = await import(${JSON.stringify(feesUrl)})
const input = JSON.parse(process.argv[1])
console.log(JSON.stringify(input.map((b) => courtFee(b))))
`
const all = [
  ...bookings,
  ...extra.map(([start]) => ({
    court: 1,
    member: 'T',
    start,
    players: adults,
    source: start.endsWith('Z') ? 'online' : 'desk',
  })),
]
const want = [...expected, ...extra.map(([, fee]) => fee)]
const labels = [
  ...bookings.map((b) => `${b.member} ${b.start}`),
  ...extra.map(([start, , why]) => `${why} (${start})`),
]
for (const TZ of ['UTC', 'Europe/London', 'America/Los_Angeles', 'Asia/Tokyo']) {
  const env = { ...process.env, TZ }
  const fees = JSON.parse(
    execFileSync(process.execPath, ['--input-type=module', '-e', script, JSON.stringify(all)], {
      cwd: dir,
      env,
      encoding: 'utf8',
    }),
  )
  fees.forEach((fee, i) => assert.equal(fee, want[i], `${labels[i]} with TZ=${TZ}`))
  const takings = (month) =>
    execFileSync(process.execPath, ['bin/takings.mjs', month], { cwd: dir, env, encoding: 'utf8' })
      .trim()
      .split('\n')
      .at(-1)
  assert.equal(takings('2026-10'), 'Total £134.00', `October total with TZ=${TZ}`)
  assert.equal(takings('2026-09'), 'Total £36.00', `September total with TZ=${TZ}`)
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
