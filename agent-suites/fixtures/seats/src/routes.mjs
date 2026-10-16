import { availableSeats } from './shows.mjs'

/** req: { method, path, query, body, user } (user is set by the session middleware). */
export async function handle(store, req) {
  const seats = req.path.match(/^\/shows\/([\w-]+)\/seats$/)
  if (req.method === 'GET' && seats) {
    const available = await availableSeats(store, seats[1])
    return available ? { status: 200, body: available } : { status: 404, body: 'no such show' }
  }
  return { status: 404, body: 'not found' }
}
