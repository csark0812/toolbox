/** The date a patient is due back (YYYY-MM-DD), a number of months after their last check-up. */
export function dueDate(lastSeen, months) {
  const date = new Date(`${lastSeen}T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() + months)
  return date.toISOString().slice(0, 10)
}

/** Patients still with the practice who are due in a month (YYYY-MM), by due date then name. */
export function dueIn(patients, month) {
  return patients
    .filter((patient) => !patient.left)
    .map((patient) => ({ ...patient, due: dueDate(patient.lastSeen, patient.months) }))
    .filter((patient) => patient.due.startsWith(`${month}-`))
    .sort((a, b) => a.due.localeCompare(b.due) || a.name.localeCompare(b.name))
}
