// Hidden acceptance for the departure board speed-up: the same boards as the original on random
// timetables (unpadded and after-midnight times, set-down-only and terminating calls, loop trips
// calling twice at a stop, several exceptions for one date where the last wins, exceptions outside
// a calendar's dates, unknown services and stops, duplicate stop ids, route numbers that sort
// numerically and same-minute ties), the frozen timing script under target with the same work,
// and the work committed on the branch.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { departureBoards } = await import(pathToFileURL(join(dir, 'src/boards.mjs')).href)

const minutes = (time) => {
  const [, hours, mins] = /^(\d{1,2}):(\d{2})$/.exec(time)
  return Number(hours) * 60 + Number(mins)
}

const clock = (time) => {
  const total = minutes(time) % (24 * 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/** Whether a service runs on a date: its calendar, unless the last exception for that date says otherwise. */
function runs(timetable, serviceId, date) {
  const service = timetable.services.find((entry) => entry.id === serviceId)
  if (!service) return false
  const exception = timetable.exceptions
    .filter((entry) => entry.service === serviceId && entry.date === date)
    .at(-1)
  if (exception) return exception.runs
  if (date < service.from || date > service.to) return false
  const weekday = (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7
  return service.days[weekday] !== '.'
}

/** The departure board for every stop on a service date, in the order the stops are listed. */
function reference(timetable, date) {
  return timetable.stops.map((stop) => {
    const departures = []
    for (const trip of timetable.trips) {
      if (!runs(timetable, trip.service, date)) continue
      const last = trip.calls[trip.calls.length - 1]
      trip.calls.forEach((call, i) => {
        if (call.stop !== stop.id || i === trip.calls.length - 1 || call.pickup === false) return
        departures.push({
          time: call.time,
          route: trip.route,
          trip: trip.id,
          to: timetable.stops.find((entry) => entry.id === last.stop)?.name ?? last.stop,
        })
      })
    }
    departures.sort(
      (a, b) =>
        minutes(a.time) - minutes(b.time) ||
        a.route.localeCompare(b.route, 'en', { numeric: true }),
    )
    return {
      stop: stop.id,
      name: stop.name,
      departures: departures.map((departure) => ({ ...departure, time: clock(departure.time) })),
    }
  })
}

let seed = 47
const next = () => (seed = (seed * 48271) % 2147483647)
const pick = (list) => list[next() % list.length]
const ROUTES = ['1', '2', '10', '02', 'N1', 'X10', 'x2', '2A']
const DATES = ['2026-11-29', '2026-11-30', '2026-12-01', '2026-12-05', '2026-12-06', '2027-01-04']
for (let round = 0; round < 400; round++) {
  const stops = Array.from({ length: 1 + (next() % 5) }, (_, i) => ({
    id: `S${i}`,
    name: `Stop ${i}`,
  }))
  if (next() % 5 === 0) stops.push({ id: 'S0', name: 'Stop zero again' })
  const ids = [...stops.map((stop) => stop.id), 'GHOST']
  const services = [
    { id: 'WK', days: 'MTWTF..', from: '2026-11-30', to: '2026-12-31' },
    { id: 'WE', days: '.....SS', from: '2026-11-01', to: '2026-12-05' },
  ]
  if (next() % 4 === 0)
    services.push({ id: 'WK', days: '......S', from: '2026-01-01', to: '2027-12-31' })
  const exceptions = []
  for (let n = next() % 5; n > 0; n--)
    exceptions.push({
      service: pick(['WK', 'WE', 'NONE']),
      date: pick(DATES),
      runs: next() % 2 === 0,
    })
  const trips = []
  for (let n = next() % 12; n > 0; n--) {
    let at = pick([360, 361, 362, 1438, 1439, 1440, 1442])
    const calls = Array.from({ length: 1 + (next() % 5) }, () => {
      at += next() % 3
      const hours = Math.floor(at / 60)
      const time = `${next() % 2 ? hours : String(hours).padStart(2, '0')}:${String(at % 60).padStart(2, '0')}`
      return next() % 6 === 0
        ? { stop: pick(ids), time, pickup: false }
        : next() % 9 === 0
          ? { stop: pick(ids), time, pickup: true }
          : { stop: pick(ids), time }
    })
    trips.push({
      id: `T${n}`,
      route: pick(ROUTES),
      service: pick(['WK', 'WE', 'WE', 'WK', 'NONE']),
      calls,
    })
  }
  const timetable = { stops, services, exceptions, trips }
  const frozen = JSON.stringify(timetable)
  const date = pick(DATES)
  assert.deepEqual(
    departureBoards(timetable, date),
    reference(timetable, date),
    `round ${round} on ${date}: ${frozen}`,
  )
  assert.equal(JSON.stringify(timetable), frozen, "the caller's timetable is not changed")
}
assert.equal(
  execFileSync(process.execPath, ['bin/board.mjs', 'MKT', '2026-11-02'], {
    cwd: dir,
    encoding: 'utf8',
  }),
  [
    'Market Square, 2026-11-02',
    '06:11  1    to University',
    '06:11  2    to Park Lane',
    '06:11  10   to Victoria',
    '23:56  1    to University',
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
assert.equal(perf.work, 150, 'a board for every stop')
assert.equal(perf.departures, 60672, 'the same departures')
// Target is 25 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 55, `median ${perf.medianMs} ms is far above the 25 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
