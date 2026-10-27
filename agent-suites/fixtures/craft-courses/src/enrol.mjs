import { bySignupTime } from './order.mjs'

/**
 * Give out places in sign-up order. Each row is `place`, `waiting` (the course is full)
 * or `duplicate` (a second form from someone who already has a place on that course).
 */
export function enrol(courses, signups) {
  const taken = Object.fromEntries(courses.map((course) => [course.id, 0]))
  const placed = new Set()
  return bySignupTime(signups).map((signup) => {
    const course = courses.find((c) => c.id === signup.course)
    const row = { name: signup.name, course: course.id }
    if (taken[course.id] >= course.places)
      return { ...row, status: 'waiting', reason: 'course full' }
    taken[course.id] += 1
    const key = `${course.id}:${signup.name}`
    if (placed.has(key)) return { ...row, status: 'duplicate' }
    placed.add(key)
    return { ...row, status: 'place' }
  })
}

/** Places taken on each course, counted from the rows. */
export function placesTaken(courses, rows) {
  return courses.map((course) => ({
    name: course.name,
    taken: rows.filter((row) => row.course === course.id && row.status === 'place').length,
    places: course.places,
  }))
}
