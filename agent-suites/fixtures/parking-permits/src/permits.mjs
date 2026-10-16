import { addDays } from './dates.mjs'

export const PERMIT_DAYS = 365

/** The dates a renewal of `permit` covers: from the day after it ends, for a year. */
export function renewal(permit) {
  const starts = addDays(permit.ends, 1)
  const ends = addDays(starts, PERMIT_DAYS - 1)
  return { starts, ends }
}

/** Permits whose last day falls in `month` (`YYYY-MM`). */
export const expiringIn = (permits, month) =>
  permits.filter((permit) => permit.ends.startsWith(`${month}-`))
