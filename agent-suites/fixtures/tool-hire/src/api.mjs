import { listHires, viewHire } from './hires.mjs'

const ROUTES = {
  'GET /hires': listHires,
  'GET /hires/:id': viewHire,
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

/** Routes a request to its handler; handlers may answer with a promise. */
export async function route(method, path, request = {}, session = null) {
  for (const [key, handler] of Object.entries(ROUTES)) {
    const [verb, pattern] = key.split(' ')
    const params = verb === method && match(pattern, path)
    if (params) return handler({ query: {}, body: {}, ...request, params }, session)
  }
  return { status: 404, body: { error: 'no such route' } }
}
