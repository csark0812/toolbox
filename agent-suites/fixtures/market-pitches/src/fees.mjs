/** Day fee for a standard pitch, in pounds. Season and charity pitches pay nothing on the day. */
export const PITCH_FEE = 22

/** Parse the attendance CSV into records. */
export function parseAttendance(text) {
  const [header, ...rows] = text.trim().split('\n')
  const keys = header.split(',')
  return rows.map((row) => Object.fromEntries(row.split(',').map((v, i) => [keys[i], v.trim()])))
}

/** True when `date` (YYYY-MM-DD) is the fifth Saturday of its month. */
export function isFifthSaturday(date) {
  const day = new Date(`${date}T12:00:00Z`)
  // A fifth Saturday comes after four full weeks of the month.
  return day.getUTCDay() === 6 && day.getUTCDate() >= 28
}

/** Fee owed by one pitch on its date, in pounds. */
export function pitchFee(pitch) {
  if (pitch.kind !== 'standard') return 0
  return isFifthSaturday(pitch.date) ? 0 : PITCH_FEE
}

/** Pitch fees for every date starting with `period` (a year or a month), in pounds. */
export function fees(pitches, period) {
  return pitches
    .filter((pitch) => pitch.date.startsWith(period))
    .reduce((sum, pitch) => sum + pitchFee(pitch), 0)
}
