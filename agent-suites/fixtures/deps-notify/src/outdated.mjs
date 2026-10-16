import { compare } from './semver.mjs'

/** One status per dependency: `current` when the latest release is the declared one, else `update`. */
export function outdated(manifest, registry) {
  return Object.entries(manifest.dependencies).map(([name, range]) => {
    const latest = registry[name]
    if (!latest) return { name, range, latest: null, status: 'missing' }
    const pinned = range.replace(/^[\^~]/, '')
    let status = 'update'
    try {
      if (compare(latest, pinned) === 0) status = 'current'
    } catch {
      status = 'update'
    }
    return { name, range, latest, status }
  })
}
