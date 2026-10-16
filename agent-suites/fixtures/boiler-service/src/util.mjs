const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** `2026-11-04` -> `Wed 4 Nov 2026`. */
export function fmtDate(iso) {
  const [year, month, day] = iso.split('-').map(Number)
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  return `${DAYS[weekday]} ${day} ${MONTHS[month - 1]} ${year}`
}

/** Pence as pounds. */
export const money = (pence) => `£${(pence / 100).toFixed(2)}`

/** The date a year after `iso`; 29 February moves to 28 February. */
export function aYearAfter(iso) {
  const [year, month, day] = iso.split('-').map(Number)
  const next = month === 2 && day === 29 ? 28 : day
  return `${year + 1}-${String(month).padStart(2, '0')}-${String(next).padStart(2, '0')}`
}
