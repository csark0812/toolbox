import { bookPitch, listPitches, myBookings } from './bookings.mjs'

const ROUTES = {
  'GET /pitches': listPitches,
  'GET /bookings': myBookings,
  'POST /pitches/:id/bookings': bookPitch,
}

const match = (pattern, path) => {
  const want = pattern.split('/')
  const got = path.split('/')
  if (want.length !== got.length) return null
  const params = {}
  for (const [index, part] of want.entries()) {
    if (part.startsWith(':')) params[part.slice(1)] = decodeURIComponent(got[index])
    else if (part !== got[index]) return null
  }
  return params
}

/** Routes a request to its handler. */
export function route(method, path, request = {}, session = null) {
  for (const [key, handler] of Object.entries(ROUTES)) {
    const [verb, pattern] = key.split(' ')
    const params = verb === method && match(pattern, path)
    if (params) return handler({ body: {}, today: '2027-05-01', ...request, params }, session)
  }
  return { status: 404, body: { error: 'no such route' } }
}
