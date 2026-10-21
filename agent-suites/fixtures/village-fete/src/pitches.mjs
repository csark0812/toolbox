export const PITCHES = {
  small: { metres: 3, fee: 1500 },
  large: { metres: 6, fee: 3000 },
}

export const money = (pence) => `£${(pence / 100).toFixed(2)}`

/** What each stall that is still coming owes for its pitch. Charities pay half. */
export function pitchFees(stalls) {
  return stalls
    .filter((stall) => !stall.cancelled)
    .map((stall) => {
      const pitch = Object.assign(
        PITCHES[stall.size],
        stall.charity ? { fee: PITCHES[stall.size].fee / 2 } : {},
      )
      return { ...stall, metres: pitch.metres, pence: pitch.fee }
    })
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = [
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

/** The fete's date written out, for example "Saturday 4 July 2026". */
export function longDate(iso) {
  const date = new Date(`${iso}T12:00:00Z`)
  return `${DAYS[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}
