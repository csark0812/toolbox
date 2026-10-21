#!/usr/bin/env node
// Print the hottest functions of a V8 CPU profile by self time, one short line each.
//   node --cpu-prof --cpu-prof-dir=<dir> <bench script>   then   node <skill>/scripts/hot.mjs <dir|file> [--top 10]
// A folder means its newest .cpuprofile. Node internals and idle time are folded into one line each.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'

/** Self time per function, in milliseconds, hottest first. */
export function hotspots(profile, top = 10, cwd = process.cwd()) {
  const byId = new Map(profile.nodes.map((node) => [node.id, node]))
  const self = new Map()
  const deltas = profile.timeDeltas ?? []
  profile.samples.forEach((id, index) => {
    const node = byId.get(id)
    const { functionName, url, lineNumber } = node.callFrame
    const file = url.startsWith('file://') ? relative(cwd, new URL(url).pathname) : url
    const name =
      !url || url.startsWith('node:')
        ? `(${functionName || 'node internals'})`
        : `${functionName || '(anonymous)'} ${file}:${lineNumber + 1}`
    self.set(name, (self.get(name) ?? 0) + (deltas[index] ?? 0) / 1000)
  })
  const total = [...self.values()].reduce((sum, ms) => sum + ms, 0) || 1
  return [...self.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([name, ms]) => ({
      name,
      ms: Math.round(ms * 10) / 10,
      share: Math.round((ms / total) * 100),
    }))
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const [target, ...rest] = process.argv.slice(2)
  const top = Number(rest[rest.indexOf('--top') + 1] || 10)
  if (!target) {
    console.error('Usage: hot.mjs <profile-dir|file.cpuprofile> [--top 10]')
    process.exit(2)
  }
  let file = target
  if (statSync(target).isDirectory()) {
    const newest = readdirSync(target)
      .filter((name) => name.endsWith('.cpuprofile'))
      .map((name) => join(target, name))
      .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0]
    if (!newest) {
      console.error(`No .cpuprofile in ${target}`)
      process.exit(2)
    }
    file = newest
  }
  for (const { name, ms, share } of hotspots(JSON.parse(readFileSync(file, 'utf8')), top))
    console.log(`${String(share).padStart(3)}%  ${ms} ms  ${name}`)
}
