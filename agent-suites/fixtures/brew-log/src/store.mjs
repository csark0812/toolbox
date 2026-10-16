import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const defaultDir = fileURLToPath(new URL('../data', import.meta.url))

/** Every batch in the data folder. */
export function loadBatches() {
  const dir = process.env.BREW_DATA_DIR || defaultDir
  return JSON.parse(readFileSync(join(dir, 'batches.json'), 'utf8'))
}
