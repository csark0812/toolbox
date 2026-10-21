// A full timetable for the network, generated the same way every time.
export const DATE = '2026-12-28'

export function makeTimetable() {
  let seed = 20261228
  const next = () => (seed = (seed * 48271) % 2147483647)
  const pad = (n) => String(n).padStart(3, '0')
  const stops = Array.from({ length: 150 }, (_, i) => ({ id: `S${pad(i)}`, name: `Stop ${i}` }))
  const services = [
    { id: 'WK', days: 'MTWTF..', from: '2026-09-01', to: '2027-06-30' },
    { id: 'SA', days: '.....S.', from: '2026-09-01', to: '2027-06-30' },
    { id: 'SU', days: '......S', from: '2026-09-01', to: '2027-06-30' },
    { id: 'SCH', days: 'MTWTF..', from: '2026-09-01', to: '2026-12-18' },
  ]
  const exceptions = []
  for (let day = 1; day <= 31; day++) {
    const date = `2026-12-${String(day).padStart(2, '0')}`
    for (const service of services)
      if (next() % 3 === 0) exceptions.push({ service: service.id, date, runs: next() % 2 === 0 })
  }
  exceptions.push({ service: 'WK', date: DATE, runs: false })
  exceptions.push({ service: 'SU', date: DATE, runs: true })
  exceptions.push({ service: 'SA', date: DATE, runs: true })
  const trips = []
  for (let route = 1; route <= 24; route++) {
    const path = Array.from({ length: 14 + (next() % 10) }, () => stops[next() % stops.length].id)
    if (route % 6 === 0) path.push(path[0], path[1])
    for (const service of services) {
      const headway = service.id === 'WK' ? 10 : 15
      for (let start = 5 * 60 + (next() % headway); start < 24 * 60 + 40; start += headway) {
        const forward = (start / headway) % 2 < 1
        const order = forward ? path : [...path].reverse()
        let at = start
        const calls = order.map((stop, i) => {
          if (i) at += 1 + (next() % 4)
          const time = `${next() % 2 ? Math.floor(at / 60) : String(Math.floor(at / 60)).padStart(2, '0')}:${String(at % 60).padStart(2, '0')}`
          return next() % 25 === 0 ? { stop, time, pickup: false } : { stop, time }
        })
        trips.push({
          id: `${route}-${service.id}-${start}`,
          route: String(route),
          service: service.id,
          calls,
        })
      }
    }
  }
  return { stops, services, exceptions, trips }
}
