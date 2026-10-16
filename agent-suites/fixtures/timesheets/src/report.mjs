import { isoWeek } from './weeks.mjs'

/** Minutes worked in one shift; a shift ending before it starts runs past midnight. */
export function shiftMinutes(start, end) {
  const toMinutes = (text) => {
    const [, h, m] = new RegExp('^(\\d{2}):(\\d{2})$').exec(text)
    return Number(h) * 60 + Number(m)
  }
  const minutes = toMinutes(end) - toMinutes(start)
  return minutes < 0 ? minutes + 24 * 60 : minutes
}

const hours = (minutes) => Math.round((minutes / 60) * 100) / 100

/** Weekly rows per person: total hours, overtime above 40 h and projects worked on. */
export function weeklyReport(entries, people) {
  const known = new Set(people.map((person) => person.id))
  const rows = []
  for (const person of people) {
    const mine = entries.filter((entry) => entry.person === person.id)
    const weeks = {}
    for (const entry of mine) {
      const week = isoWeek(entry.date)
      weeks[week] ??= { minutes: 0, projects: [] }
      weeks[week].minutes += shiftMinutes(entry.start, entry.end)
      if (!weeks[week].projects.includes(entry.project)) weeks[week].projects.push(entry.project)
      weeks[week].shifts = (weeks[week].shifts ?? 0) + 1
    }
    for (const [week, total] of Object.entries(weeks))
      rows.push({
        person: person.name,
        week,
        shifts: total.shifts,
        hours: hours(total.minutes),
        overtime: hours(Math.max(0, total.minutes - 40 * 60)),
        projects: [...total.projects].sort().join(', '),
      })
  }
  rows.sort((a, b) => a.person.localeCompare(b.person, 'en') || a.week.localeCompare(b.week, 'en'))
  const skipped = entries.filter((entry) => !known.has(entry.person)).length
  return { rows, skipped }
}
