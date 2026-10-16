const VERSION = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/

/** Parse `1.2.3` or `1.2.3-beta.1` into numbers and an optional pre-release tag. */
export function parse(text) {
  const match = VERSION.exec(String(text).trim())
  if (!match) throw new TypeError(`not a version: ${text}`)
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ?? null,
  }
}

/** Negative, zero or positive, like a sort comparator. A pre-release sorts before its release. */
export function compare(a, b) {
  const x = typeof a === 'string' ? parse(a) : a
  const y = typeof b === 'string' ? parse(b) : b
  for (const key of ['major', 'minor', 'patch']) if (x[key] !== y[key]) return x[key] - y[key]
  if (x.prerelease === y.prerelease) return 0
  if (x.prerelease === null) return 1
  if (y.prerelease === null) return -1
  return x.prerelease < y.prerelease ? -1 : 1
}
