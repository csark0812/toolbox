/** Path part of a request URL: no query or fragment, and no trailing slash except on the root. */
function pathOf(url) {
  const path = url.split('?')[0].split('#')[0]
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}

/** How specific each segment of a pattern is: 0 literal, 1 param, 2 wildcard. */
function ranks(pattern) {
  return pattern
    .split('/')
    .filter(Boolean)
    .map((segment) => (segment === '*' ? 2 : segment.startsWith(':') ? 1 : 0))
}

/** Negative when route `a` is more specific than route `b`. */
function bySpecificity(a, b) {
  const left = ranks(a.path)
  const right = ranks(b.path)
  for (let i = 0; i < Math.min(left.length, right.length); i++)
    if (left[i] !== right[i]) return left[i] - right[i]
  return 0
}

const escapeLiteral = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** A RegExp for a pattern, and the names of its captures in order. */
function compile(pattern) {
  const names = []
  const source = pattern
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      if (segment === '*') {
        names.push('*')
        return '/(.+)'
      }
      if (segment.startsWith(':')) {
        names.push(segment.slice(1))
        return '/([^/]+)'
      }
      return `/${escapeLiteral(segment)}`
    })
    .join('')
  return { regex: new RegExp(`^${source || '/'}$`), names }
}

const methodMatches = (route, method) =>
  route.method === '*' || route.method === method || (method === 'HEAD' && route.method === 'GET')

export function createRouter(routes) {
  return {
    match(method, url) {
      const path = pathOf(url)
      const ordered = [...routes].sort(bySpecificity)
      for (const route of ordered) {
        if (!methodMatches(route, method)) continue
        const { regex, names } = compile(route.path)
        const found = regex.exec(path)
        if (!found) continue
        try {
          const params = {}
          names.forEach((name, i) => {
            params[name] = decodeURIComponent(found[i + 1])
          })
          return { name: route.name, params }
        } catch {
          continue
        }
      }
      return null
    },
  }
}
