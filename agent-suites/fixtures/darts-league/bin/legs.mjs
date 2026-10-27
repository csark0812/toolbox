import { readFileSync } from 'node:fs'
import { legLine } from '../src/legs.mjs'

const legs = JSON.parse(readFileSync(new URL('../data/legs.json', import.meta.url), 'utf8'))
for (const leg of legs) console.log(legLine(leg))
