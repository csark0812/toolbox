import { readFileSync } from 'node:fs'
import { board } from '../src/flights.mjs'

const flights = JSON.parse(readFileSync(new URL('../data/flights.json', import.meta.url), 'utf8'))
for (const line of board(flights)) console.log(line)
