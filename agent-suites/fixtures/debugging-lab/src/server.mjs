import { createServer } from 'node:http'
export function makeServer() {
  return createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/login') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ signedIn: true }))
    } else {
      res.writeHead(405)
      res.end('Method not allowed')
    }
  })
}
