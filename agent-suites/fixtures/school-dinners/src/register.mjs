/** Whether a pupil was off school on a day (dates are YYYY-MM-DD). */
export function isAbsent(absences, pupil, day) {
  return absences.some((absence) => absence.pupil === pupil && absence.date === day)
}
