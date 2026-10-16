// A deterministic route table for a large API and a burst of requests against it.
export function makeTraffic({ resources = 25, requests = 2500 } = {}) {
  let seed = 424242
  const next = () => (seed = (seed * 48271) % 2147483647)
  const words = ['alpha', 'beta', 'gamma', 'delta', 'omega', 'kappa', 'sigma', 'theta', 'zeta']
  const routes = [{ method: 'GET', path: '/', name: 'root' }]
  for (let r = 0; r < resources; r++) {
    const base = `/${words[r % words.length]}${r}`
    routes.push(
      { method: 'GET', path: base, name: `list${r}` },
      { method: 'POST', path: base, name: `create${r}` },
      { method: 'GET', path: `${base}/:id`, name: `show${r}` },
      { method: 'PUT', path: `${base}/:id`, name: `update${r}` },
      { method: 'GET', path: `${base}/recent`, name: `recent${r}` },
      { method: 'GET', path: `${base}/:id/items/:itemId`, name: `item${r}` },
      { method: 'GET', path: `${base}/files/*`, name: `files${r}` },
    )
  }
  routes.push({ method: '*', path: '/status', name: 'status' })
  const methods = ['GET', 'GET', 'GET', 'POST', 'PUT', 'HEAD', 'DELETE']
  const urls = Array.from({ length: requests }, () => {
    const r = next() % (resources + 2)
    const base = `/${words[r % words.length]}${r}`
    switch (next() % 8) {
      case 0:
        return base
      case 1:
        return `${base}/${next() % 1000}?page=${next() % 9}`
      case 2:
        return `${base}/recent/`
      case 3:
        return `${base}/${next() % 1000}/items/x%20${next() % 50}`
      case 4:
        return `${base}/files/img/${next() % 99}.png`
      case 5:
        return next() % 2 ? '/status' : '/'
      case 6:
        return `${base}/%E0%A4%A`
      default:
        return `${base}/nope/${next() % 7}/deeper`
    }
  })
  return { routes, requests: urls.map((url) => [methods[next() % methods.length], url]) }
}
