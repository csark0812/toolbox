// Hidden acceptance for the statements speed-up: the same statements as the original on random
// books (trips by guests, out of date order, on the first and last day of a period, hours as strings
// and halfway tenths rounded trip by trip, periods with no trips falling back to shares, members who
// joined or left, double shares, negative and one-penny costs, ties on remainders), the same answers
// when the same books are changed in place between calls (a trip logged, corrected or moved, a bill
// corrected or entered, a period widened, members joining and leaving, trips cleared) and when two
// sets of books with the same ids alternate, so nothing may be remembered from one call to the next,
// the caller's books never reordered or changed, the frozen timing script under target with the
// same work, and the work committed on the branch.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { statements, apportion } = await import(pathToFileURL(join(dir, 'src/statements.mjs')).href)

/** Hours are logged to the nearest six minutes, so work in whole tenths of an hour and keep the sums exact. */
const tenths = (hours) => Math.round(Number(hours) * 10)

const within = (date, from, to) => {
  const day = Date.parse(date)
  return day >= Date.parse(from) && day <= Date.parse(to)
}

/** Whether the member was in the syndicate for any part of the cost's period. */
const onBoard = (member, cost) =>
  Date.parse(member.joined ?? '1970-01-01') <= Date.parse(cost.to) &&
  Date.parse(member.left ?? '9999-12-31') >= Date.parse(cost.from)

/** Tenths of an hour the member spent out on the boat during the cost's period. */
function usage(member, trips, cost) {
  return trips
    .filter((trip) => trip.member === member.id && within(trip.date, cost.from, cost.to))
    .reduce((sum, trip) => sum + tenths(trip.hours), 0)
}

/**
 * Splits `pence` in proportion to `weights` in whole pence: everyone gets the floor of their exact
 * share, and the pennies left over go one each to the largest remainders, earlier members first on a tie.
 */
function refApportion(pence, weights) {
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  const shares = weights.map((weight) => Math.floor((pence * weight) / total))
  const order = weights
    .map((weight, i) => ({ i, rest: pence * weight - shares[i] * total }))
    .sort((a, b) => b.rest - a.rest || a.i - b.i)
  let left = pence - shares.reduce((sum, share) => sum + share, 0)
  for (const { i } of order) {
    if (left <= 0) break
    shares[i]++
    left--
  }
  return shares
}

/** Each member's weight for one cost. */
function weights(members, trips, cost) {
  const aboard = members.filter((member) => onBoard(member, cost))
  const pool = aboard.length ? aboard : members
  const byShares = members.map((member) => (pool.includes(member) ? (member.share ?? 1) : 0))
  if (cost.basis === 'shares') return byShares
  if (cost.basis === 'equal') return members.map((member) => (pool.includes(member) ? 1 : 0))
  const hours = members.map((member) => usage(member, trips, cost))
  return hours.some((h) => h > 0) ? hours : byShares
}

/** Every member's statement: their share of each cost, in pence, and their total. */
function reference(members, trips, costs) {
  const lines = members.map(() => [])
  for (const cost of costs) {
    const shares = refApportion(cost.pence, weights(members, trips, cost))
    shares.forEach((pence, i) => lines[i].push({ cost: cost.id, pence }))
  }
  return members.map((member, i) => ({
    id: member.id,
    name: member.name,
    lines: lines[i],
    total: lines[i].reduce((sum, line) => sum + line.pence, 0),
  }))
}

const check = (members, trips, costs, label) => {
  const frozen = JSON.stringify({ members, trips, costs })
  const expected = reference(members, trips, costs)
  assert.deepEqual(statements(members, trips, costs), expected, `${label}: ${frozen}`)
  assert.equal(
    JSON.stringify({ members, trips, costs }),
    frozen,
    `${label}: the books are not changed`,
  )
}

let seed = 97
const next = () => (seed = (seed * 48271) % 2147483647)
const pick = (list) => list[next() % list.length]
const DATES = [
  '2026-05-31',
  '2026-06-01',
  '2026-06-02',
  '2026-06-15',
  '2026-06-30',
  '2026-07-01',
  '2026-07-31',
]
const HOURS = [1, 1.25, 1.15, 0.05, 2.45, '0.8', '3', 0, 6.95, 0.35]
for (let round = 0; round < 400; round++) {
  const members = Array.from({ length: 1 + (next() % 4) }, (_, i) => {
    const member = { id: `m${i}`, name: `Member ${i}` }
    if (next() % 3 === 0) member.share = 1 + (next() % 3)
    if (next() % 4 === 0) member.joined = pick(DATES)
    if (next() % 4 === 0) member.left = pick(DATES)
    return member
  })
  const ids = [...members.map((member) => member.id), 'guest']
  const trips = Array.from({ length: next() % 12 }, () => ({
    member: pick(ids),
    date: pick(DATES),
    hours: pick(HOURS),
  }))
  const costs = Array.from({ length: 1 + (next() % 5) }, (_, i) => {
    const [a, b] = [pick(DATES), pick(DATES)].sort()
    return {
      id: `c${i}`,
      from: a,
      to: b,
      pence: pick([0, 1, 2, 999, 1001, 41000, -1, -1001, 7]),
      basis: pick(['hours', 'hours', 'shares', 'equal']),
    }
  })
  check(members, trips, costs, `round ${round}`)
  for (let k = 0; k < 4; k++) {
    const pence = pick([1, 2, 99, -7, 1001])
    const parts = members.map(() => next() % 4)
    if (parts.some((part) => part > 0))
      assert.deepEqual(
        apportion(pence, parts),
        refApportion(pence, parts),
        `apportion ${pence} ${parts}`,
      )
  }
}

// The web page keeps one set of books and changes it in place between statements.
const books = {
  members: [
    { id: 'ros', name: 'Ros', share: 2 },
    { id: 'tam', name: 'Tam' },
  ],
  trips: [{ member: 'ros', date: '2026-06-02', hours: 2 }],
  costs: [{ id: 'fuel', from: '2026-06-01', to: '2026-06-30', pence: 1000, basis: 'hours' }],
}
const other = JSON.parse(JSON.stringify(books))
other.trips[0].member = 'tam'
const live = (label) => {
  check(books.members, books.trips, books.costs, label)
  check(other.members, other.trips, other.costs, `${label} (other books)`)
}
live('first look')
live('second look')
books.trips.push({ member: 'tam', date: '2026-06-03', hours: 2 })
live('a trip logged')
books.trips[0].hours = 5
live('a trip corrected')
books.trips[1].date = '2026-07-03'
live('a trip moved to July')
books.costs[0].pence = 1700
live('a bill corrected')
books.costs[0].to = '2026-07-31'
live('a period widened')
books.costs.push({
  id: 'mooring',
  from: '2026-06-01',
  to: '2026-06-30',
  pence: 41000,
  basis: 'shares',
})
live('a bill entered')
books.members.push({ id: 'mei', name: 'Mei', joined: '2026-06-15' })
books.trips.push({ member: 'mei', date: '2026-06-20', hours: 1.25 })
live('a member joined')
books.members[1].left = '2026-05-31'
live('a member left')
books.members[0].share = 1
live('a share sold')
books.trips.length = 0
live('trips cleared')

assert.equal(
  execFileSync(process.execPath, ['bin/statements.mjs'], { cwd: dir, encoding: 'utf8' }),
  [
    'Ros: £763.66',
    '  mooring-2026-06      £205.00',
    '  fuel-2026-06          £24.56',
    '  mooring-2026-07      £205.00',
    '  fuel-2026-07           £4.84',
    '  fuel-2026-08           £5.01',
    '  insurance-2026       £321.75',
    '  rebate-2026           -£2.50',
    'Tam: £541.49',
    '  mooring-2026-06      £102.50',
    '  fuel-2026-06          £14.74',
    '  mooring-2026-07      £102.50',
    '  fuel-2026-07           £0.00',
    '  fuel-2026-08           £2.50',
    '  insurance-2026       £321.75',
    '  rebate-2026           -£2.50',
    'Ifan: £435.78',
    '  mooring-2026-06      £102.50',
    '  fuel-2026-06          £14.03',
    '  mooring-2026-07        £0.00',
    '  fuel-2026-07           £0.00',
    '  fuel-2026-08           £0.00',
    '  insurance-2026       £321.75',
    '  rebate-2026           -£2.50',
    'Mei: £449.39',
    '  mooring-2026-06        £0.00',
    '  fuel-2026-06           £0.00',
    '  mooring-2026-07      £102.50',
    '  fuel-2026-07          £25.15',
    '  fuel-2026-08           £2.50',
    '  insurance-2026       £321.75',
    '  rebate-2026           -£2.51',
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
assert.equal(perf.work, 3360, 'a line for every member and cost')
assert.equal(perf.billed, 3996493, 'every penny billed')
assert.deepEqual(
  perf.totals,
  [458825, 317720, 317534, 258843, 311107, 446375, 317257, 308014, 314050, 301065, 346105, 299598],
  'the same totals',
)
// Target is 10 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 20, `median ${perf.medianMs} ms is far above the 10 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
