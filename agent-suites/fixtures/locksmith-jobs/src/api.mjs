import { jobs } from './store.mjs'

export const PAGE_SIZE = 10
const notFound = { status: 404, body: { error: 'not found' } }
const unauthorised = { status: 401, body: { error: 'sign in' } }

/** One of the signed-in customer's jobs. */
export function handleJob(request, session) {
  if (!session?.customerId) return unauthorised
  const job = jobs().find((entry) => entry.id === request.params.id)
  if (!job || job.customerId !== session.customerId) return notFound
  return { status: 200, body: job }
}

/** A page of the signed-in customer's jobs, newest first. Pages start at 1. */
export function listJobs(request, session) {
  if (!session?.customerId) return unauthorised
  const page = Math.max(1, Number(request.query.page ?? 1) || 1)
  const own = jobs()
    .filter((job) => job.customerId === session.customerId)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  return { status: 200, body: own.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) }
}

const ROUTES = { 'GET /jobs': listJobs, 'GET /jobs/:id': handleJob }

/** Routes a request to its handler. */
export function route(method, path, request, session) {
  const [, base, id] = path.split('/')
  const key = id ? `${method} /${base}/:id` : `${method} /${base}`
  const handler = ROUTES[key]
  if (!handler) return notFound
  return handler({ ...request, params: { id } }, session)
}
