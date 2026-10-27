import { trackParcel } from './tracking.mjs'

const ROUTES = {
  'GET /track/:number': trackParcel,
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

/** Routes a request to its handler. Tracking needs no sign-in. */
export function route(method, path, request = {}) {
  for (const [key, handler] of Object.entries(ROUTES)) {
    const [verb, pattern] = key.split(' ')
    const params = verb === method && match(pattern, path)
    if (params) return handler({ query: {}, body: {}, ...request, params })
  }
  return { status: 404, body: { error: 'no such route' } }
}
