import { slotEnd } from './schedule.mjs'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** A night's heading and one line per request. */
export function nightLines(night, results) {
  const date = new Date(`${night}T12:00:00Z`)
  const heading = `${DAYS[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`
  return [
    heading,
    ...results.map(
      (result) =>
        `  ${result.slot}-${slotEnd(result.slot)}  ${result.member.padEnd(14)}${result.status}`,
    ),
  ]
}
