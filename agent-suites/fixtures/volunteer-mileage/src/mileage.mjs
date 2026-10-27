export const RATE = 0.45
export const LOWER_RATE = 0.25
export const THRESHOLD = 10000

export const parseCsv = (text) => {
  const [header, ...lines] = text.trim().split('\n')
  const keys = header.split(',')
  return lines.map((line) =>
    Object.fromEntries(line.split(',').map((value, i) => [keys[i], value])),
  )
}

const miles = (trips) => trips.reduce((total, trip) => total + Number(trip.miles), 0)
const pence = (pounds) => Math.round(pounds * 100) / 100

// First day of the tax year that a month (YYYY-MM) falls in.
export function taxYearStart(month) {
  const year = Number(month.slice(0, 4))
  return `${year}-01-01`
}

// What one driver is owed for one month.
export function monthlyPay(trips, driver, month) {
  const theirs = trips.filter((trip) => trip.driver === driver && trip.status === 'done')
  const start = taxYearStart(month)
  const before = miles(theirs.filter((trip) => trip.date >= start && trip.date < `${month}-01`))
  const thisMonth = miles(theirs.filter((trip) => trip.date.startsWith(month)))
  const rate = before < THRESHOLD ? RATE : LOWER_RATE
  return { driver, before, miles: thisMonth, rate, pay: pence(thisMonth * rate) }
}
