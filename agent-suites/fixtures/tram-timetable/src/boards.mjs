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
export function departureBoards(timetable, date) {
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
