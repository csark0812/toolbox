import { formatLocal, zonedToUtc } from './zone.mjs'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

/** The first YYYY-MM-DD on or after `date` that falls on `weekday`. */
export function firstOnWeekday(date, weekday) {
  const start = new Date(`${date}T00:00:00Z`)
  const shift = (WEEKDAYS.indexOf(weekday) - start.getUTCDay() + 7) % 7
  return new Date(start.getTime() + shift * DAY_MS).toISOString().slice(0, 10)
}

/** Every start of a weekly class, from its first session, as long as `before` allows. */
export function* sessions(cls, before) {
  const first = zonedToUtc(firstOnWeekday(cls.starts, cls.weekday), cls.time, cls.timeZone)
  for (let at = first.getTime(); at < before.getTime(); at += WEEK_MS) yield new Date(at)
}

/** All classes that start in [from, from + days), earliest first. */
export function timetable(classes, from, days) {
  const start = new Date(`${from}T00:00:00Z`)
  const end = new Date(start.getTime() + days * DAY_MS)
  const rows = []
  for (const cls of classes)
    for (const at of sessions(cls, end))
      if (at >= start)
        rows.push({
          id: cls.id,
          name: cls.name,
          start: at,
          label: `${formatLocal(at, cls.timeZone)}  ${cls.name}`,
        })
  return rows.sort((a, b) => a.start - b.start || (a.id < b.id ? -1 : 1))
}
