import { lessons, saveLesson } from './store.mjs'

const MINUTE = 60_000
const at = (start) => new Date(`${start}Z`).getTime()

/** True when the instructor has no booked lesson overlapping [start, start + minutes). */
export function isFree(instructorId, start, minutes, ignoreId = null) {
  const from = at(start)
  const to = from + minutes * MINUTE
  return !lessons().some(
    (lesson) =>
      lesson.instructorId === instructorId &&
      lesson.status === 'booked' &&
      lesson.id !== ignoreId &&
      at(lesson.start) < to &&
      from < at(lesson.start) + lesson.minutes * MINUTE,
  )
}

/** The signed-in learner's lessons, soonest first. */
export function listLessons(request, session) {
  if (!session?.learnerId) return { status: 401, body: { error: 'sign in' } }
  const own = lessons()
    .filter((lesson) => lesson.learnerId === session.learnerId)
    .sort((a, b) => at(a.start) - at(b.start))
  return { status: 200, body: own }
}

/** Books a lesson with the learner's own instructor. */
export function bookLesson(request, session) {
  if (!session?.learnerId) return { status: 401, body: { error: 'sign in' } }
  const { start, minutes, instructorId } = request.body
  if (!isFree(instructorId, start, minutes)) {
    return { status: 409, body: { error: 'the instructor is busy then' } }
  }
  const lesson = {
    id: `ls-${100 + lessons().length + 1}`,
    learnerId: session.learnerId,
    instructorId,
    start,
    minutes,
    status: 'booked',
  }
  saveLesson(lesson)
  return { status: 201, body: lesson }
}
