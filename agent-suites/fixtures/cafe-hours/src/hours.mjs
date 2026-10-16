export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
export const LABELS = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
}

/** The week as printed on the sign: one line per day. */
export function weekTable(hours) {
  return DAYS.map((day) => {
    const spec = (hours[day] ?? 'closed').trim()
    const text =
      spec === 'closed'
        ? 'closed'
        : spec
            .split(/\s*,\s*/)
            .join(', ')
            .replaceAll('-', '–')
    return `${LABELS[day]}  ${text}`
  })
}
