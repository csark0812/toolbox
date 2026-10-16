import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderIndex, renderPost } from './render.mjs'

/** Every output file as [relative path, html], newest post first in the index. */
export function buildSite(posts) {
  const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  return [
    ['index.html', renderIndex(sorted)],
    ...sorted.map((post) => [`${post.slug}.html`, renderPost(post)]),
  ]
}

export function writeSite(files, outDir) {
  mkdirSync(outDir, { recursive: true })
  for (const [path, html] of files) writeFileSync(join(outDir, path), html)
}
