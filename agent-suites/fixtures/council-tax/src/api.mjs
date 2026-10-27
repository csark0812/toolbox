import { signIn, viewAccount } from './account.mjs'

const ROUTES = {
  'POST /sign-in': signIn,
  'GET /account': viewAccount,
}

/** Routes a request to its handler. */
export function route(method, path, request = {}, session = null) {
  const [pathname, search = ''] = path.split('?')
  const handler = ROUTES[`${method} ${pathname}`]
  if (!handler) return { status: 404, body: { error: 'no such route' } }
  const query = Object.fromEntries(new URLSearchParams(search))
  return handler({ body: {}, ...request, query }, session)
}
