import { createServer } from 'node:http'
import { login } from './auth.mjs'

const ROUTES = { 'POST /login': login }

/** Wire the handlers to HTTP. JSON bodies in, JSON out. */
export function startServer(deps, port = 8080) {
  return createServer(async (request, response) => {
    let raw = ''
    for await (const chunk of request) raw += chunk
    const handler = ROUTES[`${request.method} ${request.url.split('?')[0]}`]
    const result = handler
      ? await handler(
          { body: raw ? JSON.parse(raw) : {}, headers: request.headers, url: request.url },
          deps,
        )
      : { status: 404, body: { error: 'not found' } }
    response.writeHead(result.status, { 'content-type': 'application/json' })
    response.end(JSON.stringify(result.body))
  }).listen(port)
}
