import { readFileSync } from 'node:fs'
import { swimmerLine } from '../src/swimmers.mjs'

const swimmers = JSON.parse(readFileSync(new URL('../data/swimmers.json', import.meta.url), 'utf8'))
for (const swimmer of swimmers) console.log(swimmerLine(swimmer))
