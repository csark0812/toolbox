const minutes = (time) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/**
 * What a stop's screen shows at `now` (HH:MM). Departures that leave before someone at the screen
 * could walk to the stop are left off, so nobody runs for a bus they cannot catch.
 */
export function departures(stop, timetable, now) {
  return timetable
    .filter((d) => d.stop === stop.id)
    .map((d) => ({ ...d, wait: minutes(d.time) - minutes(now) }))
    .filter((d) => d.wait >= stop.walkMinutes)
    .sort((a, b) => a.wait - b.wait || a.route.localeCompare(b.route))
    .slice(0, 6)
}

/** How a departure is shown: due, minutes away, or its clock time. */
export const when = (departure) =>
  departure.wait === 0 ? 'due' : departure.wait <= 15 ? `${departure.wait} min` : departure.time
