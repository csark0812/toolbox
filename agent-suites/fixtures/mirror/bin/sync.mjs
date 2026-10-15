import { readFileSync } from 'node:fs'
import { upload } from '../src/store.mjs'
import { formatBytes, syncAll } from '../src/sync.mjs'

const files = JSON.parse(readFileSync(new URL('../data/manifest.json', import.meta.url), 'utf8'))
const summary = await syncAll(files, upload)
console.log(`uploaded ${summary.uploaded}/${files.length} (${formatBytes(summary.bytes)})`)
if (summary.failed.length) console.log(`failed: ${summary.failed.join(', ')}`)
