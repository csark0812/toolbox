/** Term start dates. */
export const TERMS = {
  '2026-autumn': '2026-09-07',
  '2027-spring': '2027-01-04',
  '2027-summer': '2027-04-19',
}

const DAY = 24 * 60 * 60 * 1000

/** The date `days` days after (or, if negative, before) a YYYY-MM-DD date. */
export const addDays = (date, days) =>
  new Date(Date.parse(date) + days * DAY).toISOString().slice(0, 10)
