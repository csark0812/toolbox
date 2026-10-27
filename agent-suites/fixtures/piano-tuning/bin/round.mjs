import { readFileSync } from 'node:fs'
import { dueRound } from '../src/round.mjs'

const today = process.argv[2] ?? new Date().toISOString().slice(0, 10)
const pianos = JSON.parse(readFileSync(new URL('../data/pianos.json', import.meta.url), 'utf8'))
for (const line of dueRound(pianos, today)) console.log(line)
