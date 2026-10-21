import { dateOf, dayNumber } from './dates.mjs'

export const GAP_DAYS = 84

/** The visits in the merged history export: { donor, date, outcome, site }. */
export function parseHistory(text) {
  const [, ...lines] = text.trim().split('\n')
  return lines.map((line) => {
    const [donor, date, outcome, site] = line.split(',').map((field) => field.trim())
    return { donor, date, outcome, site }
  })
}

/** The date of a donor's most recent donation, or null for a first-time donor. */
export function lastDonation(history, donor) {
  const dates = history
    .filter((visit) => visit.donor === donor)
    .map((visit) => visit.date)
    .sort()
  return dates.at(-1) ?? null
}

/** Whether a donor is due on `date`, with their last donation and the day they became due. */
export function dueOn(history, donor, date) {
  const last = lastDonation(history, donor)
  if (!last) return { due: true, last: null, from: null }
  const from = dayNumber(last) + GAP_DAYS
  return { due: dayNumber(date) >= from, last, from: dateOf(from) }
}
