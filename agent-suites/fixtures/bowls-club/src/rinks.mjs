export const RINKS = 6
export const SESSIONS = ['morning', 'afternoon', 'evening']

/** Why a request cannot have its rink, or null when it can. */
function problemWith(request, booked) {
  if (!Number.isInteger(request.rink) || request.rink < 1 || request.rink >= RINKS)
    return 'no such rink'
  if (!SESSIONS.includes(request.session)) return 'no such session'
  const taken = booked[request.rink - 1].some(
    (other) => other.date === request.date && other.session === request.session,
  )
  return taken ? 'rink taken' : null
}

/** Takes the requests in order; each sees the rinks given out before it. */
export function allocate(requests) {
  const booked = Array(RINKS).fill([])
  return requests.map((request) => {
    const problem = problemWith(request, booked)
    if (!problem) booked[request.rink - 1].push(request)
    return { request, problem }
  })
}
