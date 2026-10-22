let nextId = 100

/** Lists the signed-in member's bookings. */
export function handleList(request, session, store) {
  if (!session?.memberId) return { status: 401, body: { error: 'sign in' } }
  return {
    status: 200,
    body: store.bookings.filter((entry) => entry.memberId === session.memberId),
  }
}

/** Books the signed-in member onto a course; it stays unpaid until they pay at the boathouse. */
export function handleBook(request, session, store) {
  if (!session?.memberId) return { status: 401, body: { error: 'sign in' } }
  const course = store.courses.find((entry) => entry.id === request.body.courseId)
  if (!course) return { status: 404, body: { error: 'no such course' } }
  const booking = {
    id: `b${nextId++}`,
    memberId: session.memberId,
    name: session.name,
    phone: session.phone,
    courseId: course.id,
    status: 'unpaid',
  }
  store.bookings.push(booking)
  return { status: 201, body: booking }
}
