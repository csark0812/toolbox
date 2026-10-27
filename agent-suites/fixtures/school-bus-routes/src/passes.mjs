export const TERM_START = '2026-09-01'

/** A pupil's age in whole years on the given date (both 'YYYY-MM-DD'). */
export function ageOn(dob, date) {
  return Number(date.slice(0, 4)) - Number(dob.slice(0, 4))
}

/** How far a pupil of this age is expected to walk, in miles. */
export function walkLimit(age) {
  return age < 8 ? 2 : 3
}

/** The outcome of every application, in the order they arrived. */
export function allocate(pupils, routes, on = TERM_START) {
  return pupils.map((pupil, i) => {
    const limit = walkLimit(ageOn(pupil.dob, on))
    if (!(pupil.miles > limit)) return { pupil, pass: false, reason: 'walking distance' }
    const ahead = pupils.slice(0, i).filter((other) => other.route === pupil.route).length
    if (ahead >= routes[pupil.route].seats)
      return { pupil, pass: false, reason: `route ${pupil.route} full` }
    return { pupil, pass: true }
  })
}

/** Passes given on each route. */
export function seatsUsed(outcomes) {
  const used = {}
  for (const { pupil, pass } of outcomes) if (pass) used[pupil.route] = (used[pupil.route] ?? 0) + 1
  return used
}
