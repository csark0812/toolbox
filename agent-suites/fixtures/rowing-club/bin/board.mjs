import { readFileSync } from 'node:fs'
import { board } from '../src/outings.mjs'

const outings = JSON.parse(readFileSync(new URL('../data/outings.json', import.meta.url), 'utf8'))
for (const line of board(outings)) console.log(line)
