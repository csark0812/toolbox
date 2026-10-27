import { readFileSync } from 'node:fs'
import { gameLine } from '../src/games.mjs'

const games = JSON.parse(readFileSync(new URL('../data/games.json', import.meta.url), 'utf8'))
for (const game of games) console.log(gameLine(game))
