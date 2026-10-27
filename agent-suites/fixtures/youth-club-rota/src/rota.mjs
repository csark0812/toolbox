export const parseCsv = (text) => {
  const [header, ...lines] = text.trim().split('\n')
  const keys = header.split(',')
  return lines.map((line) =>
    Object.fromEntries(line.split(',').map((value, i) => [keys[i], value])),
  )
}

// Whether a volunteer's DBS check covers a session on this date (YYYY-MM-DD).
export function hasValidCheck(volunteer, date) {
  if (!volunteer) return false
  if (volunteer.update_service === 'yes') return true
  if (!volunteer.dbs_issued) return false
  const issued = volunteer.dbs_issued
  const expires = `${Number(issued.slice(0, 4)) + 3}${issued.slice(4)}`
  return date < expires
}

// The problems with one session, or an empty list if it can go ahead.
export function sessionProblems(session, volunteers) {
  const byName = new Map(volunteers.map((volunteer) => [volunteer.name, volunteer]))
  const helpers = session.helpers ? session.helpers.split(';') : []
  const problems = []
  if (!hasValidCheck(byName.get(session.lead), session.date)) {
    problems.push(`${session.lead} has no valid DBS check`)
  }
  if (helpers.length === 0) problems.push('only one adult')
  return problems
}
