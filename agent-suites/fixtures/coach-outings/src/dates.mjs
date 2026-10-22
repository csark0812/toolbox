// The office has always typed dates the British way, day first: 07/11/2026, 7/11/2026,
// 07.11.2026 and 7-11-2026 all turn up in the files and all mean 7 November.
export function parseUkDate(text) {
  const match = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(String(text).trim())
  if (!match) throw new Error(`not a date: ${text}`)
  const [, day, month, year] = match.map(Number)
  return { year, month, day }
}

const pad = (n) => String(n).padStart(2, '0')
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const LONG_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const utc = ({ year, month, day }) => Date.UTC(year, month - 1, day)

export const sortKey = (text) => {
  const date = parseUkDate(text)
  return `${date.year}-${pad(date.month)}-${pad(date.day)}`
}
export const monthOf = (text) => sortKey(text).slice(0, 7)
export const yearOf = (text) => parseUkDate(text).year

export const daysBetween = (from, to) =>
  Math.round((utc(parseUkDate(to)) - utc(parseUkDate(from))) / 86400000)

// "Sat 07 Nov 2026"
export function dayLabel(text) {
  const date = parseUkDate(text)
  return `${DAYS[new Date(utc(date)).getUTCDay()]} ${pad(date.day)} ${MONTHS[date.month - 1]} ${date.year}`
}
// "2 Oct"
export const shortLabel = (text) => {
  const date = parseUkDate(text)
  return `${date.day} ${MONTHS[date.month - 1]}`
}
export const monthLabel = (month) =>
  `${LONG_MONTHS[Number(month.slice(5)) - 1]} ${month.slice(0, 4)}`
export const shortMonthLabel = (month) =>
  `${MONTHS[Number(month.slice(5)) - 1]} ${month.slice(0, 4)}`

// What Brimble's booking system expects: always two-digit day and month, slashes.
export const brimbleDate = (text) => {
  const date = parseUkDate(text)
  return `${pad(date.day)}/${pad(date.month)}/${date.year}`
}

export function today() {
  const now = new Date()
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`
}
