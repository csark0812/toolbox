import { readFileSync } from 'node:fs'
import { batchLine } from '../src/batches.mjs'

const batches = JSON.parse(readFileSync(new URL('../data/batches.json', import.meta.url), 'utf8'))
for (const batch of batches) console.log(batchLine(batch))
