import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** The Markdown files in a folder, sorted by name, with their text. A byte-order mark is dropped. */
export function readChapters(folder) {
  return readdirSync(folder)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) => ({
      name,
      text: readFileSync(join(folder, name), 'utf8').replace(/^\uFEFF/, ''),
    }))
}
