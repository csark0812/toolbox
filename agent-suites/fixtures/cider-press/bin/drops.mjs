import { readFileSync } from 'node:fs'
import { dropLine } from '../src/drops.mjs'

const drops = JSON.parse(readFileSync(new URL('../data/drops.json', import.meta.url), 'utf8'))
for (const drop of drops) console.log(dropLine(drop))
